import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Ruler, ShieldCheck, Sparkles, MapPin, CalendarCheck, Shirt, Ticket, ArrowLeft, PackageX } from 'lucide-react';
import { useStore } from '../store/store';
import { useRouter } from '../lib/router';
import { PhotoCredit, ProductCard, ProductImage } from '../components/Product';
import { RentalCalendar } from '../components/Calendar';
import { Badge, Button, Empty, LinkButton, Modal, useToast } from '../components/ui';
import { activeSubscription, creditEligible, creditsLeft, findUnit, planOf, REASON_TEXT } from '../store/rules';
import { addDays, cx, fmtDate, inr, todayISO } from '../lib/util';
import { OCCASIONS } from '../data/catalogue';
import type { Product } from '../data/types';

function Gallery({ p }: { p: Product }) {
  const views = ['front', 'detail', 'swatch'] as const;
  const labels = ['Look', 'Detail', 'Fabric colour'];
  const [i, setI] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const onScroll = () => { const el = strip.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)); };
  const goTo = (k: number) => { setI(k); strip.current?.scrollTo({ left: k * (strip.current?.clientWidth ?? 0), behavior: 'smooth' }); };
  return (
    <div className="lg:grid lg:grid-cols-[84px_1fr] lg:gap-4">
      <div className="hidden lg:flex flex-col gap-3">
        {views.map((v, k) => (
          <button key={v} onClick={() => goTo(k)} aria-label={`Show ${labels[k]} view`} aria-pressed={i === k} className={cx('rounded-lg overflow-hidden aspect-[3/4] border-2 transition', i === k ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100')}><ProductImage p={p} view={v} sizes="84px" /></button>
        ))}
      </div>
      <div className="relative -mx-4 lg:mx-0">
        <div ref={strip} onScroll={onScroll} className="flex overflow-x-auto snap-x-m no-scrollbar lg:rounded-2xl" aria-roledescription="carousel" aria-label={`${p.name} images`}>
          {views.map((v, k) => (
            <div key={v} className="snap-start-m shrink-0 w-full aspect-[4/5] lg:aspect-[5/6] bg-tint" aria-label={`${labels[k]} view`} role="group"><ProductImage p={p} view={v} sizes="(min-width: 1024px) 50vw, 100vw" eager={k === 0} /></div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">{views.map((v, k) => <button key={v} onClick={() => goTo(k)} aria-label={`Image ${k + 1}`} className={cx('h-1.5 rounded-full transition-all', i === k ? 'w-6 bg-ink' : 'w-1.5 bg-ink/30')} />)}</div>
        <span className="absolute left-4 lg:left-3 top-3 rounded-full bg-white/85 text-ink text-[11px] font-bold px-2.5 py-1">{labels[i]}</span>
        {!p.imageUrl && <PhotoCredit id={p.id} className="mt-2 px-4 lg:px-0" />}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { route, go } = useRouter();
  const { state, actions, online } = useStore();
  const toast = useToast();
  const p = state.products.find((x) => x.id === route.arg);
  const [size, setSize] = useState<string | null>(null);
  const [days, setDays] = useState<2 | 3>(2);
  const [start, setStart] = useState<string | null>(null);
  const [guide, setGuide] = useState(false);
  const [useCredit, setUseCredit] = useState(true);
  const [err, setErr] = useState('');
  useEffect(() => { setSize(null); setStart(null); setErr(''); }, [route.arg]);

  const sub = activeSubscription(state);
  const min = addDays(todayISO(), state.policies.leadDays);
  const max = addDays(todayISO(), state.policies.maxAdvanceDays);
  const sizeState = useMemo(() => {
    if (!p) return {} as Record<string, string>;
    return Object.fromEntries(p.sizes.map((s) => {
      const units = state.units.filter((u) => u.productId === p.id && u.size === s && u.status !== 'retired');
      if (!units.length) return [s, 'Not stocked'];
      if (!units.some((u) => u.status === 'available')) return [s, 'In cleaning or repair'];
      return [s, ''];
    }));
  }, [p, state.units]);

  if (!p || p.archived) return <div className="gutter max-w-3xl mx-auto py-16"><Empty icon={<PackageX size={24} />} title="This garment is not available" body="It may have been retired from the pilot rack. Browse the current collection instead." action={<LinkButton href="#explore">Explore the collection</LinkButton>} /></div>;

  const fee = p.rentalPrice + (days === 3 ? state.policies.surcharge72 : 0);
  const saving = Math.round((1 - p.rentalPrice / p.retailPrice) * 100);
  const eligible = creditEligible(state, p, sub);
  const bagCredits = state.bag.filter((l) => l.useCredit).length;
  const canCredit = eligible && creditsLeft(sub) - bagCredits > 0;
  const avail = size && start ? findUnit(state, p.id, size, start, days, { otherBag: state.bag }) : null;
  const similar = state.products.filter((x) => x.id !== p.id && !x.archived && (x.category === p.category || (x.line === p.line && x.gender === p.gender))).slice(0, 4);

  const add = (thenGo: boolean) => {
    setErr('');
    if (!online) { setErr('You are offline. Reservations need a live availability check.'); return; }
    if (!size) { setErr('Choose a size first.'); return; }
    if (!start) { setErr('Choose a pickup date on the calendar.'); return; }
    const r = actions.addToBag({ productId: p.id, size, start, days, useCredit: canCredit && useCredit });
    if (!r.ok) { setErr(r.error); toast('err', r.error); return; }
    toast('ok', `${p.name} (${size}) added to your bag${r.value ? ' with a ReWear Pass credit' : ''}`);
    if (thenGo) go('bag');
  };

  return (
    <div className="gutter max-w-[1440px] mx-auto pt-4 lg:pt-8 pb-28 lg:pb-0">
      <div className="flex items-center gap-2 text-[12px] text-muted mb-4">
        <button onClick={() => history.length > 1 ? history.back() : go('explore')} className="lg:hidden h-9 w-9 -ml-2 grid place-items-center rounded-full hover:bg-tint" aria-label="Back"><ArrowLeft size={18} /></button>
        <nav aria-label="Breadcrumb" className="truncate"><a href="#home" className="hover:text-fg">Home</a> / <a href={`#${p.line}`} className="hover:text-fg">{p.line === 'formal' ? 'Formal Wear' : 'Ethnic Wear'}</a> / <span>{p.name}</span></nav>
      </div>
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-14">
        <div className="lg:sticky lg:self-start" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 90px)' }}><Gallery p={p} /></div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-brand">{p.gender === 'men' ? 'Men' : 'Women'} · {p.category} · {p.id.toUpperCase()}</p>
              <h1 className="font-serif text-[34px] lg:text-[46px] font-semibold leading-[1.02] mt-2">{p.name}</h1>
            </div>
            <WishToggle id={p.id} />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4 tnum">
            <span className="text-[30px] font-bold">{inr(fee)}</span><span className="text-muted">for {days * 24} hours</span>
            <span className="text-muted line-through">{inr(p.retailPrice)}</span><Badge tone="ok">Save {saving}% vs estimated retail</Badge>
          </div>
          <p className="text-[13px] text-muted mt-1">+ {inr(p.deposit)} refundable deposit, held separately and returned after the quality check.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {p.tier === 'premium' && <Badge tone="gold">Premium collection</Badge>}
            {sub && <Badge tone={eligible ? 'brand' : 'neutral'}>{eligible ? `Covered by ${planOf(state, sub.planId).name} credits` : `Not covered by ${planOf(state, sub.planId).name}`}</Badge>}
            <Badge>{p.color}</Badge>
            <Badge>Condition: {p.condition}</Badge>
          </div>

          {/* Size */}
          <section className="mt-7" aria-labelledby="size-h">
            <div className="flex items-center justify-between"><h2 id="size-h" className="font-semibold">Size</h2><button onClick={() => setGuide(true)} className="text-[13px] font-semibold text-brand inline-flex items-center gap-1 underline underline-offset-2"><Ruler size={15} />Size guide</button></div>
            <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="Size">
              {p.sizes.map((s) => {
                const blocked = sizeState[s];
                return (
                  <button key={s} role="radio" aria-checked={size === s} disabled={!!blocked} onClick={() => { setSize(s); setStart(null); setErr(''); }} title={blocked || undefined}
                    className={cx('min-w-[56px] h-12 px-4 rounded-xl border text-[14px] font-semibold transition', size === s ? 'bg-brand text-onbrand border-brand' : 'border-line bg-surface hover:border-fg/50', blocked && 'opacity-40 line-through cursor-not-allowed')}>{s}</button>
                );
              })}
            </div>
            {size && <p className="text-[12px] text-muted mt-2">Garment measurements for {size}: {p.measurements[size]?.map((m) => `${m.label} ${m.value}`).join(' · ')}</p>}
          </section>

          {/* Duration */}
          <section className="mt-6" aria-labelledby="dur-h">
            <h2 id="dur-h" className="font-semibold">Rental duration</h2>
            <div className="grid grid-cols-2 gap-2 mt-3" role="radiogroup" aria-label="Duration">
              {([2, 3] as const).map((d) => (
                <button key={d} role="radio" aria-checked={days === d} onClick={() => { setDays(d); setErr(''); }} className={cx('rounded-xl border p-3 text-left transition', days === d ? 'border-brand ring-1 ring-brand bg-tint' : 'border-line bg-surface')}>
                  <span className="block font-bold">{d * 24} hours</span>
                  <span className="text-[12px] text-muted tnum">{inr(p.rentalPrice + (d === 3 ? state.policies.surcharge72 : 0))}{d === 3 ? ` · +${inr(state.policies.surcharge72)} for the third day` : ' · most popular'}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Calendar */}
          <section className="mt-6 rounded-2xl border border-line bg-surface p-4" aria-labelledby="cal-h">
            <h2 id="cal-h" className="font-semibold flex items-center gap-2"><CalendarCheck size={18} className="text-brand" />Pickup date</h2>
            {!size ? <p className="text-[13px] text-muted mt-2">Choose a size to see which dates it is free.</p> : (
              <div className="mt-3">
                <RentalCalendar value={start} days={days} min={min} max={max} onSelect={(d) => { setStart(d); setErr(''); }} isAvailable={(iso) => findUnit(state, p.id, size, iso, days, { otherBag: state.bag }).reason === 'ok'} />
              </div>
            )}
            {size && start && avail && (
              <div className={cx('mt-4 rounded-xl p-3 text-[13px]', avail.reason === 'ok' ? 'bg-tint' : 'bg-terra/10 text-terra')} aria-live="polite">
                {avail.reason === 'ok'
                  ? <><b>Available.</b> Pick up {fmtDate(start, true)}, return by {fmtDate(addDays(start, days), true)}, 6 PM. {avail.free} unit{avail.free === 1 ? '' : 's'} free in {size}.</>
                  : REASON_TEXT[avail.reason]}
              </div>
            )}
          </section>

          {sub && (
            <label className={cx('mt-4 flex items-start gap-3 rounded-xl border p-3 cursor-pointer', canCredit ? 'border-brand/40 bg-tint' : 'border-line opacity-70')}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#164B35]" checked={canCredit && useCredit} disabled={!canCredit} onChange={(e) => setUseCredit(e.target.checked)} />
              <span className="text-[13px]"><b className="flex items-center gap-1.5"><Ticket size={15} />Use a ReWear Pass credit</b>
                {canCredit ? `${creditsLeft(sub) - bagCredits} credit${creditsLeft(sub) - bagCredits === 1 ? '' : 's'} available. Covers the 48-hour rental fee${days === 3 ? `; the ₹${state.policies.surcharge72} third-day charge still applies` : ''}.` : !eligible ? 'Your plan does not cover this garment.' : 'No credits left this cycle.'}</span>
            </label>
          )}

          {err && <p role="alert" className="mt-4 text-[13px] font-semibold text-terra">{err}</p>}
          <div className="hidden lg:flex gap-3 mt-6">
            <Button size="lg" variant="secondary" className="flex-1" onClick={() => add(false)}>Add to Bag</Button>
            <Button size="lg" className="flex-1" onClick={() => add(true)}>Rent Now</Button>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            <Info icon={<Sparkles size={18} />} t="Hygiene assurance" s={p.line === 'formal' && p.category === 'Shirt' ? 'Washed, steamed and sanitised after every rental.' : 'Professionally cleaned after every rental and inspected before it returns to the rack.'} />
            <Info icon={<ShieldCheck size={18} />} t={`Condition: ${p.condition}`} s="Checked for stains, seams and buttons before each pickup." />
            <Info icon={<MapPin size={18} />} t="Campus pickup" s="Collect from a ReWear pop-up rack in your chosen slot. Try it on there." />
            <Info icon={<Shirt size={18} />} t="Fit promise" s="If it does not fit at pickup, swap sizes or cancel that item in full." />
          </div>

          <Details title="Fabric and fit" open>{p.fabric}. Colour: {p.color}. Suitable for {p.occasions.map((o) => OCCASIONS.find((x) => x.id === o)?.short).join(', ')}.</Details>
          <Details title="Styling suggestions"><ul className="list-disc pl-5 space-y-1">{p.styling.map((s) => <li key={s}>{s}</li>)}</ul></Details>
          <Details title="Care instructions">{p.care}</Details>
          <Details title="Deposit and late returns">Your {inr(p.deposit)} deposit is refunded after the quality check, usually within 2 working days of return. Extensions cost {inr(state.policies.extensionPerDay)} a day and depend on the next booking. Damage is charged at repair cost and never exceeds the deposit.</Details>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-[30px] lg:text-[40px] font-semibold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 lg:gap-6">{similar.map((x) => <ProductCard key={x.id} p={x} compact />)}</div>
        </section>
      )}

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line gutter py-2.5 flex items-center gap-3" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="min-w-0"><p className="font-bold text-[18px] leading-none tnum">{inr(fee)}</p><p className="text-[11px] text-muted mt-1 truncate">{size ? `Size ${size}` : 'Choose size'} · {start ? fmtDate(start) : 'Choose date'}</p></div>
        <Button variant="secondary" className="ml-auto px-4" onClick={() => add(false)} aria-label="Add to bag">Add</Button>
        <Button className="px-6" onClick={() => add(true)}>Rent Now</Button>
      </div>

      <Modal open={guide} onClose={() => setGuide(false)} title="Size guide" wide>
        <p className="text-[13px] text-muted mb-4">Garment measurements in inches, measured flat and doubled where relevant. Compare with a similar garment you already own. If you are between sizes, choose the larger for blazers and the smaller for kurtas.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] tnum">
            <thead><tr className="text-left border-b border-line"><th className="py-2 pr-4">Size</th>{p.measurements[p.sizes[0]].map((m) => <th key={m.label} className="py-2 pr-4">{m.label}</th>)}</tr></thead>
            <tbody>{p.sizes.map((s) => <tr key={s} className={cx('border-b border-line', size === s && 'bg-tint')}><td className="py-2 pr-4 font-semibold">{s}</td>{p.measurements[s].map((m) => <td key={m.label} className="py-2 pr-4">{m.value}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="text-[13px] mt-4">Unsure? <a href="#fit" className="font-semibold text-brand underline" onClick={() => setGuide(false)}>Use Find My Fit</a> or book a fitting at a campus pop-up.</p>
      </Modal>
    </div>
  );
}

function WishToggle({ id }: { id: string }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const on = state.wishlist.includes(id);
  return <button onClick={() => { const r = actions.toggleWishlist(id); if (r.ok) toast('ok', r.value ? 'Saved to your wishlist' : 'Removed from your wishlist'); }} aria-pressed={on} aria-label={on ? 'Remove from wishlist' : 'Add to Wishlist'} className="shrink-0 h-12 w-12 rounded-full border border-line grid place-items-center hover:border-fg/40"><Heart size={20} className={on ? 'fill-terra text-terra' : ''} /></button>;
}

const Info = ({ icon, t, s }: { icon: React.ReactNode; t: string; s: string }) => (
  <div className="flex gap-3 rounded-xl bg-tint p-3.5"><span className="text-brand mt-0.5">{icon}</span><span className="text-[13px]"><b className="block">{t}</b><span className="text-muted">{s}</span></span></div>
);

function Details({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-line py-4 mt-2" open={open}>
      <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">{title}<span className="text-xl text-muted group-open:rotate-45 transition">+</span></summary>
      <div className="text-[14px] text-muted mt-3 leading-relaxed">{children}</div>
    </details>
  );
}
