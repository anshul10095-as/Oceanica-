import { useEffect, useState } from 'react';
import { ShoppingBag, Trash2, Ticket, Lock, Smartphone, CreditCard, Store, Loader2, CheckCircle2, Printer, QrCode as QrIcon, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '../store/store';
import { useRouter } from '../lib/router';
import { ProductImage } from '../components/Product';
import { Badge, Button, DemoNote, Empty, Field, LinkButton, Modal, useToast } from '../components/ui';
import { activeSubscription, creditEligible, creditsLeft, priceBag, REASON_TEXT, STATUS_LABEL } from '../store/rules';
import { addDays, cx, fmtDate, inr, todayISO } from '../lib/util';
import type { Booking } from '../data/types';

function Summary({ compact }: { compact?: boolean }) {
  const { state } = useStore();
  const pr = priceBag(state);
  const rows: [string, string, string?][] = [
    ['Rental fees', inr(pr.rental)],
    ...(pr.discount ? [['Member discount', '−' + inr(pr.discount), 'text-brand'] as [string, string, string]] : []),
    ...(pr.credits ? [[`ReWear Pass credits × ${pr.credits}`, '−' + inr(pr.creditValue), 'text-brand'] as [string, string, string]] : []),
  ];
  const rentalDue = pr.rental - pr.discount - pr.creditValue;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {!compact && <h2 className="font-serif text-[24px] font-semibold mb-4">Order summary</h2>}
      <dl className="space-y-2.5 text-[14px] tnum">
        {rows.map(([l, v, c]) => <div key={l} className="flex justify-between"><dt className="text-muted">{l}</dt><dd className={cx('font-semibold', c)}>{v}</dd></div>)}
        <div className="flex justify-between pt-2 border-t border-line"><dt>Rental charge <span className="text-muted text-[12px]">(revenue)</span></dt><dd className="font-semibold">{inr(rentalDue)}</dd></div>
        <div className="flex justify-between"><dt>Refundable deposit <span className="text-muted text-[12px]">(held, not revenue)</span></dt><dd className="font-semibold">{inr(pr.deposit)}</dd></div>
        <div className="flex justify-between pt-3 border-t border-line text-[17px]"><dt className="font-bold">Total payable now</dt><dd className="font-bold">{inr(pr.total)}</dd></div>
      </dl>
      <p className="text-[12px] text-muted mt-3">Of this, {inr(pr.deposit)} comes back to you after return and quality check.</p>
    </div>
  );
}

export function BagPage() {
  const { state, actions } = useStore();
  const { go } = useRouter();
  const toast = useToast();
  const sub = activeSubscription(state);
  const pr = priceBag(state);
  if (!state.bag.length) return (
    <div className="gutter max-w-3xl mx-auto py-12">
      <h1 className="font-serif text-[40px] font-semibold mb-6">Rental bag</h1>
      <Empty icon={<ShoppingBag size={24} />} title="Your bag is empty" body="Add a garment, size and pickup date and it will wait here while you browse." action={<LinkButton href="#explore">Explore the collection</LinkButton>} />
    </div>
  );
  const bagCreditCount = state.bag.filter((l) => l.useCredit).length;
  return (
    <div className="gutter max-w-[1200px] mx-auto pt-6 lg:pt-10">
      <h1 className="font-serif text-[40px] lg:text-[52px] font-semibold">Rental bag</h1>
      <p className="text-muted mt-1">{state.bag.length} item{state.bag.length === 1 ? '' : 's'} · availability rechecked at checkout</p>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-6">
        <ul className="space-y-4">
          {pr.lines.map(({ line, product: p, fee, discount, credit, payable, reason }) => {
            const end = addDays(line.start, line.days);
            const eligible = creditEligible(state, p, sub);
            return (
              <li key={line.lineId} className={cx('rounded-2xl border bg-surface p-3 sm:p-4 flex gap-4', reason === 'ok' ? 'border-line' : 'border-terra')}>
                <a href={`#product-${p.id}`} className="w-24 sm:w-28 shrink-0 rounded-xl overflow-hidden aspect-[3/4] bg-tint"><ProductImage p={p} /></a>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <a href={`#product-${p.id}`} className="font-semibold leading-snug hover:underline">{p.name}</a>
                    <button onClick={() => { actions.removeBagLine(line.lineId); toast('info', `${p.name} removed`); }} className="h-9 w-9 -mt-1 -mr-1 grid place-items-center rounded-full hover:bg-tint text-muted shrink-0" aria-label={`Remove ${p.name}`}><Trash2 size={17} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    <label className="text-[11px] text-muted font-semibold">Size
                      <select value={line.size} onChange={(e) => { const r = actions.updateBagLine(line.lineId, { size: e.target.value }); if (!r.ok) toast('err', r.error); }} className="field !min-h-0 !py-2 mt-1 text-[13px] text-fg">{p.sizes.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>
                    <label className="text-[11px] text-muted font-semibold">Duration
                      <select value={line.days} onChange={(e) => { const r = actions.updateBagLine(line.lineId, { days: +e.target.value as 2 | 3 }); if (!r.ok) toast('err', r.error); }} className="field !min-h-0 !py-2 mt-1 text-[13px] text-fg"><option value={2}>48 hours</option><option value={3}>72 hours</option></select>
                    </label>
                    <label className="text-[11px] text-muted font-semibold col-span-2 sm:col-span-1">Pickup
                      <input type="date" value={line.start} min={addDays(todayISO(), state.policies.leadDays)} max={addDays(todayISO(), state.policies.maxAdvanceDays)} onChange={(e) => { if (!e.target.value) return; const r = actions.updateBagLine(line.lineId, { start: e.target.value }); if (!r.ok) toast('err', r.error); }} className="field !min-h-0 !py-2 mt-1 text-[13px] text-fg" />
                    </label>
                  </div>
                  <p className="text-[12px] text-muted mt-2">Pickup {fmtDate(line.start, true)} · Return by {fmtDate(end, true)}, 6 PM</p>
                  {reason !== 'ok' && <p className="text-[12px] text-terra font-semibold mt-1" role="alert">{REASON_TEXT[reason]} Change the size or date.</p>}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                    {sub ? (
                      <label className={cx('inline-flex items-center gap-2 text-[12px] font-semibold', !eligible && 'opacity-50')}>
                        <input type="checkbox" className="h-4 w-4 accent-[#164B35]" checked={credit} disabled={!eligible || (!credit && creditsLeft(sub) - bagCreditCount <= 0)} onChange={(e) => { const r = actions.updateBagLine(line.lineId, { useCredit: e.target.checked }); if (!r.ok) toast('err', r.error); }} />
                        <Ticket size={14} />{eligible ? 'Use pass credit' : 'Not covered by your plan'}
                      </label>
                    ) : <span />}
                    <p className="text-right tnum">
                      {(credit || discount > 0) && <span className="text-[12px] text-muted line-through mr-2">{inr(fee)}</span>}
                      <b>{inr(payable)}</b><span className="block text-[11px] text-muted">+ {inr(p.deposit)} deposit</span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="space-y-4 lg:sticky lg:self-start" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 96px)' }}>
          <Summary />
          {sub ? <p className="text-[12px] text-muted flex items-center gap-1.5"><Ticket size={14} className="text-brand" />{creditsLeft(sub)} pass credit{creditsLeft(sub) === 1 ? '' : 's'} available, {bagCreditCount} applied in this bag.</p>
            : <a href="#pass" className="block rounded-xl bg-tint p-3 text-[13px]"><b>Renting more than once a month?</b> A ReWear Pass from ₹499 includes monthly rental credits.</a>}
          <Button size="lg" className="w-full" disabled={pr.errors.length > 0} onClick={() => go('checkout')}><Lock size={16} />Checkout securely</Button>
          {pr.errors.length > 0 && <p className="text-[12px] text-terra" role="alert">Resolve the highlighted items before checkout.</p>}
        </div>
      </div>
    </div>
  );
}

const SLOT_RX = /^[6-9]\d{9}$/;

export function CheckoutPage() {
  const { state, actions, online } = useStore();
  const { go } = useRouter();
  const toast = useToast();
  const s = state.student;
  const [form, setForm] = useState({ name: s.name === 'Demo Student' ? '' : s.name, college: s.college, phone: s.phone, email: s.email, location: state.policies.pickupLocations[0], slot: state.policies.pickupSlots[1], method: 'upi' as 'upi' | 'card' | 'pickup', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const pr = priceBag(state);
  if (!state.bag.length) return <div className="gutter max-w-3xl mx-auto py-12"><Empty icon={<ShoppingBag size={24} />} title="Nothing to check out" body="Your bag is empty. Add a garment first." action={<LinkButton href="#explore">Explore the collection</LinkButton>} /></div>;
  const firstPickup = [...state.bag].sort((a, b) => a.start.localeCompare(b.start))[0];
  const lastReturn = state.bag.map((l) => addDays(l.start, l.days)).sort().pop()!;
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = 'Enter your full name.';
    if (!form.college.trim()) er.college = 'Enter your college.';
    if (!SLOT_RX.test(form.phone.replace(/\s|\+91/g, ''))) er.phone = 'Enter a 10-digit Indian mobile number.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.';
    if (!form.terms) er.terms = 'Accept the rental terms to continue.';
    setErrors(er);
    if (Object.keys(er).length) { toast('err', 'Check the highlighted fields.'); return; }
    if (!online) { toast('err', 'You are offline. Reservations need a live availability check.'); return; }
    setBusy(true);
    setTimeout(() => {
      const r = actions.checkout({ ...form, phone: form.phone.replace(/\s|\+91/g, '') });
      setBusy(false);
      if (!r.ok) { toast('err', r.error); return; }
      go(`confirmation-${r.value.id.toLowerCase()}`);
    }, 1100);
  };

  const methods = [
    { id: 'upi', icon: Smartphone, t: 'UPI', s: 'Simulated UPI collect request. No app is opened.' },
    { id: 'card', icon: CreditCard, t: 'Card', s: 'Simulated card payment. No card details are collected.' },
    { id: 'pickup', icon: Store, t: 'Pay at pickup', s: 'Pay rental and deposit at the rack. Booking is held.' },
  ] as const;

  return (
    <form onSubmit={submit} noValidate className="gutter max-w-[1200px] mx-auto pt-6 lg:pt-10">
      <a href="#bag" className="text-[13px] text-muted hover:text-fg">← Back to bag</a>
      <h1 className="font-serif text-[40px] lg:text-[52px] font-semibold mt-2">Checkout</h1>
      <div className="mt-3 rounded-xl border border-dashed border-terra/60 px-4 py-2.5 text-[13px] text-terra font-semibold">Demonstration checkout: no real payment is taken and no inventory outside this demo is reserved.</div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-6">
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-[26px] font-semibold mb-4">Your details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" error={errors.name} htmlFor="c-name"><input id="c-name" className="field" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="College" error={errors.college} htmlFor="c-college"><input id="c-college" className="field" value={form.college} onChange={(e) => set('college', e.target.value)} /></Field>
              <Field label="Mobile number" error={errors.phone} hint="Used for pickup reminders" htmlFor="c-phone"><input id="c-phone" className="field" inputMode="numeric" autoComplete="tel-national" placeholder="98xxxxxxxx" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
              <Field label="Email" error={errors.email} hint="Your pickup pass is sent here" htmlFor="c-email"><input id="c-email" type="email" className="field" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            </div>
          </section>
          <section>
            <h2 className="font-serif text-[26px] font-semibold mb-4">Campus pickup</h2>
            <Field label="Pickup rack" htmlFor="c-loc" hint="Proposed rack locations, illustrative until approved."><select id="c-loc" className="field" value={form.location} onChange={(e) => set('location', e.target.value)}>{state.policies.pickupLocations.map((l) => <option key={l}>{l}</option>)}</select></Field>
            <p className="text-[13px] font-semibold mt-4 mb-2">Pickup slot on {fmtDate(firstPickup.start, true)}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Pickup slot">
              {state.policies.pickupSlots.map((sl) => <button type="button" role="radio" aria-checked={form.slot === sl} key={sl} onClick={() => set('slot', sl)} className={cx('h-12 rounded-xl border text-[13px] font-semibold tnum', form.slot === sl ? 'bg-brand text-onbrand border-brand' : 'border-line bg-surface')}>{sl}</button>)}
            </div>
            <p className="mt-3 text-[13px] rounded-xl bg-tint p-3"><b>Return deadline:</b> {fmtDate(lastReturn, true)} by 6 PM at the same rack.</p>
          </section>
          <section>
            <h2 className="font-serif text-[26px] font-semibold mb-4">Payment</h2>
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {methods.map(({ id, icon: I, t, s: sub }) => (
                <button type="button" role="radio" aria-checked={form.method === id} key={id} onClick={() => set('method', id)} className={cx('w-full flex items-center gap-3 rounded-xl border p-4 text-left', form.method === id ? 'border-brand ring-1 ring-brand bg-tint' : 'border-line bg-surface')}>
                  <I size={20} className="text-brand" /><span className="flex-1"><b className="block text-[14px]">{t}</b><span className="text-[12px] text-muted">{sub}</span></span>
                  <span className={cx('h-5 w-5 rounded-full border-2', form.method === id ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_rgb(var(--surface))]' : 'border-line')} />
                </button>
              ))}
            </div>
          </section>
          <label className="flex items-start gap-3 text-[14px]">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#164B35]" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} />
            <span>I accept the <a href="#policy-rental" target="_blank" rel="noreferrer" className="underline font-semibold">rental terms</a>: return by the deadline, report damage at return, and accept repair-cost deductions from the deposit.{errors.terms && <span className="block text-terra text-[12px] mt-1">{errors.terms}</span>}</span>
          </label>
        </div>
        <div className="space-y-4 lg:sticky lg:self-start" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 96px)' }}>
          <ul className="rounded-2xl border border-line bg-surface p-4 space-y-3">
            {pr.lines.map(({ line, product: p, payable, credit }) => (
              <li key={line.lineId} className="flex gap-3 text-[13px]"><span className="h-16 w-12 rounded-lg overflow-hidden shrink-0"><ProductImage p={p} /></span><span className="flex-1 min-w-0"><b className="block truncate">{p.name}</b><span className="text-muted">{line.size} · {line.days * 24}h · {fmtDate(line.start)}</span>{credit && <Badge tone="brand" className="ml-1">Credit</Badge>}</span><b className="tnum">{inr(payable)}</b></li>
            ))}
          </ul>
          <Summary compact />
          <Button size="lg" className="w-full" type="submit" disabled={busy || !online}>{busy ? <><Loader2 size={18} className="animate-spin" />Processing simulated payment</> : form.method === 'pickup' ? `Reserve · pay ${inr(pr.total)} at pickup` : `Pay ${inr(pr.total)} (simulated)`}</Button>
          {!online && <p className="text-[12px] text-terra">You are offline. Reservations are paused until you reconnect.</p>}
        </div>
      </div>
    </form>
  );
}

export function PickupPass({ b }: { b: Booking }) {
  const { state } = useStore();
  const [qr, setQr] = useState('');
  useEffect(() => { QRCode.toDataURL(`REWEAR-DEMO|${b.id}|${b.items.map((i) => i.unitId).join(',')}`, { margin: 1, width: 360, color: { dark: '#102F23', light: '#FFFFFF' } }).then(setQr).catch(() => setQr('')); }, [b.id]);
  const end = addDays(b.items[0].start, b.items[0].days + (b.extension?.status === 'approved' ? b.extension.days : 0));
  return (
    <div className="rounded-[22px] overflow-hidden bg-forest-deep text-ivory shadow-lift">
      <div className="p-5 flex items-center justify-between">
        <div><p className="eyebrow text-gold">Digital pickup pass</p><p className="font-serif text-[26px] font-semibold tnum">{b.id}</p></div>
        <span className="rounded-full border border-dashed border-gold/70 text-gold text-[10px] font-bold tracking-[0.2em] px-2.5 py-1">DEMO</span>
      </div>
      <div className="bg-white mx-5 rounded-2xl p-4 grid place-items-center">{qr ? <img src={qr} alt={`Demonstration QR code for booking ${b.id}`} className="w-44 h-44" /> : <QrIcon size={120} className="text-forest" />}</div>
      <dl className="p-5 grid grid-cols-2 gap-4 text-[13px]">
        <div><dt className="text-ivory/60">Pickup</dt><dd className="font-semibold">{fmtDate(b.items[0].start, true)}<br />{b.pickupSlot}</dd></div>
        <div><dt className="text-ivory/60">Return by</dt><dd className="font-semibold">{fmtDate(end, true)}<br />6:00 PM</dd></div>
        <div className="col-span-2"><dt className="text-ivory/60">Rack</dt><dd className="font-semibold">{b.pickupLocation}</dd></div>
        <div><dt className="text-ivory/60">Deposit held</dt><dd className="font-semibold tnum">{inr(b.depositHeld)}</dd></div>
        <div><dt className="text-ivory/60">Status</dt><dd className="font-semibold">{STATUS_LABEL[b.status]}</dd></div>
      </dl>
      <p className="px-5 pb-5 text-[11px] text-ivory/55">Demonstration booking. This QR code is not valid at any real rack. {state.student.name !== 'Demo Student' ? `Issued to ${b.contact.name}.` : ''}</p>
    </div>
  );
}

export function Receipt({ b }: { b: Booking }) {
  const { state } = useStore();
  const lines = b.items.map((it) => ({ it, p: state.products.find((p) => p.id === it.productId)! }));
  const fees = b.items.reduce((a, i) => a + i.rentalFee, 0);
  const disc = b.items.reduce((a, i) => a + i.discount, 0);
  const credit = b.items.filter((i) => i.creditUsed).reduce((a, i) => a + (lines.find((l) => l.it === i)?.p.rentalPrice ?? 0), 0);
  return (
    <div className="print-area bg-white text-ink rounded-xl p-6 text-[13px]">
      <div className="flex justify-between items-start border-b border-black/10 pb-4">
        <div><p className="font-serif text-[24px] font-semibold">ReWear Campus</p><p className="text-black/55">Rental receipt · Demonstration</p></div>
        <div className="text-right tnum"><p className="font-bold">{b.id}</p><p className="text-black/55">{fmtDate(b.createdAt.slice(0, 10))}</p></div>
      </div>
      <p className="mt-4"><b>{b.contact.name}</b> · {b.contact.college}<br /><span className="text-black/60">{b.contact.phone} · {b.contact.email}</span></p>
      <table className="w-full mt-4 tnum">
        <thead><tr className="text-left text-black/55 border-b border-black/10"><th className="py-2">Item</th><th>Dates</th><th className="text-right">Fee</th></tr></thead>
        <tbody>{lines.map(({ it, p }) => <tr key={it.lineId} className="border-b border-black/5"><td className="py-2">{p.name}<br /><span className="text-black/55">Size {it.size} · unit {it.unitId}</span></td><td>{fmtDate(it.start)} → {fmtDate(addDays(it.start, it.days))}</td><td className="text-right">{inr(it.rentalFee)}{it.creditUsed && <span className="block text-[11px] text-black/55">credit</span>}</td></tr>)}</tbody>
      </table>
      <dl className="mt-4 space-y-1 tnum ml-auto max-w-xs">
        <div className="flex justify-between"><dt>Rental fees</dt><dd>{inr(fees)}</dd></div>
        {disc > 0 && <div className="flex justify-between"><dt>Member discount</dt><dd>−{inr(disc)}</dd></div>}
        {credit > 0 && <div className="flex justify-between"><dt>Pass credits ({b.creditsRedeemed})</dt><dd>−{inr(credit)}</dd></div>}
        <div className="flex justify-between font-semibold border-t border-black/10 pt-1"><dt>Rental revenue</dt><dd>{inr(b.rentalPaid)}</dd></div>
        <div className="flex justify-between"><dt>Refundable deposit</dt><dd>{inr(b.depositHeld)}</dd></div>
        <div className="flex justify-between font-bold text-[15px] border-t border-black/10 pt-1"><dt>{b.paymentMethod === 'pickup' ? 'Due at pickup' : 'Paid (simulated)'}</dt><dd>{inr(b.rentalPaid + b.depositHeld)}</dd></div>
      </dl>
      <p className="mt-5 text-[11px] text-black/55">Payment method: {b.paymentMethod === 'upi' ? 'UPI (simulated)' : b.paymentMethod === 'card' ? 'Card (simulated)' : 'Pay at pickup'}. Pickup at {b.pickupLocation}, {b.pickupSlot}. Prices are proposed pilot prices. No real transaction has taken place.</p>
    </div>
  );
}

export function ConfirmationPage() {
  const { route } = useRouter();
  const { state } = useStore();
  const [receipt, setReceipt] = useState(false);
  const b = state.bookings.find((x) => x.id.toLowerCase() === route.arg.toLowerCase());
  if (!b) return <div className="gutter max-w-3xl mx-auto py-12"><Empty icon={<QrIcon size={24} />} title="Booking not found" body="This booking may have been cleared when the demo was reset." action={<LinkButton href="#wardrobe">Go to My Wardrobe</LinkButton>} /></div>;
  return (
    <div className="gutter max-w-[1100px] mx-auto pt-8 lg:pt-12">
      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        <div className="anim-rise">
          <span className="h-14 w-14 rounded-full bg-tint text-brand grid place-items-center"><CheckCircle2 size={28} /></span>
          <h1 className="font-serif text-[42px] lg:text-[60px] font-semibold leading-none mt-5">You're booked.</h1>
          <p className="text-muted mt-3 text-[16px] max-w-[50ch]">Booking <b className="text-fg tnum">{b.id}</b> is reserved. Show the pickup pass at the rack. {b.paymentMethod === 'pickup' ? `Bring ${inr(b.rentalPaid + b.depositHeld)} for payment at pickup.` : 'A simulated payment has been recorded.'}</p>
          <div className="mt-6 rounded-2xl border border-line bg-surface divide-y divide-line">
            {b.items.map((it) => { const p = state.products.find((x) => x.id === it.productId)!; return (
              <div key={it.lineId} className="flex gap-4 p-4"><span className="h-20 w-16 rounded-lg overflow-hidden shrink-0"><ProductImage p={p} /></span><div className="text-[14px]"><b>{p.name}</b><p className="text-muted">Size {it.size} · {it.days * 24} hours{it.creditUsed ? ' · pass credit' : ''}</p><p className="text-muted">{fmtDate(it.start, true)} → {fmtDate(addDays(it.start, it.days), true)}</p></div></div>
            ); })}
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-[13px] tnum">
            <div className="rounded-xl bg-tint p-3"><dt className="text-muted">Rental</dt><dd className="font-bold text-[16px]">{inr(b.rentalPaid)}</dd></div>
            <div className="rounded-xl bg-tint p-3"><dt className="text-muted">Deposit</dt><dd className="font-bold text-[16px]">{inr(b.depositHeld)}</dd></div>
            <div className="rounded-xl bg-tint p-3"><dt className="text-muted">Credits used</dt><dd className="font-bold text-[16px]">{b.creditsRedeemed}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3 mt-6">
            <LinkButton href="#wardrobe">Go to My Wardrobe</LinkButton>
            <Button variant="secondary" onClick={() => setReceipt(true)}><Printer size={16} />View receipt</Button>
            <LinkButton href="#explore" variant="ghost">Keep browsing</LinkButton>
          </div>
        </div>
        <PickupPass b={b} />
      </div>
      <Modal open={receipt} onClose={() => setReceipt(false)} title="Booking receipt" wide footer={!__SINGLE__ ? <Button onClick={() => window.print()}><Download size={16} />Print or save as PDF</Button> : <DemoNote>Printing opens the browser's print dialog on the deployed app. The sandboxed preview cannot open it.</DemoNote>}>
        <Receipt b={b} />
      </Modal>
    </div>
  );
}
