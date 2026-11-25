import { useState } from 'react';
import { Shirt, Ticket, Heart, Recycle, Wallet, QrCode, LifeBuoy, CalendarPlus, XCircle, Clock } from 'lucide-react';
import { useStore } from '../store/store';
import { ProductCard, ProductImage } from '../components/Product';
import { Badge, Button, Empty, LinkButton, Modal, Stat, useToast, Field } from '../components/ui';
import { activeSubscription, ACTIVE_STATUSES, bookingEnd, COMPLETED_STATUSES, creditsLeft, planOf, STATUS_LABEL, TIMELINE, timelineIndex } from '../store/rules';
import { addDays, cx, diffDays, fmtDate, fmtShort, inr, todayISO } from '../lib/util';
import type { Booking } from '../data/types';
import { PickupPass } from './Bag';
import { MyAppointments } from './Popups';

export function Timeline({ b }: { b: Booking }) {
  const idx = timelineIndex(b.status);
  if (idx < 0) return <p className="text-[13px] text-terra font-semibold">Cancelled · simulated full refund issued</p>;
  return (
    <ol className="flex items-start overflow-x-auto no-scrollbar -mx-1 px-1 pb-1" aria-label="Rental progress">
      {TIMELINE.map((step, i) => {
        const done = i < idx || (i === idx && b.status === 'refunded');
        const current = i === idx && b.status !== 'refunded';
        return (
          <li key={step} className="flex-1 min-w-[78px] flex flex-col items-center text-center relative" aria-current={current ? 'step' : undefined}>
            {i > 0 && <span className={cx('absolute top-[9px] right-1/2 w-full h-[2px]', i <= idx ? 'bg-brand' : 'bg-line')} />}
            <span className={cx('relative z-10 h-5 w-5 rounded-full border-2 grid place-items-center', done ? 'bg-brand border-brand' : current ? 'bg-gold border-gold ring-4 ring-gold/25' : 'bg-surface border-line')}>{done && <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 6.5 L5 9 L10 3" stroke="rgb(var(--onbrand))" strokeWidth="2" fill="none" /></svg>}</span>
            <span className={cx('mt-1.5 text-[10.5px] leading-tight font-semibold px-0.5', current ? 'text-fg' : done ? 'text-muted' : 'text-muted/60')}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function BookingCard({ b, onPass, onSupport }: { b: Booking; onPass: () => void; onSupport: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [ext, setExt] = useState(false);
  const end = bookingEnd(b);
  const left = diffDays(end, todayISO());
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 lg:p-5">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2"><b className="tnum">{b.id}</b><Badge tone={b.status === 'cancelled' ? 'bad' : b.status === 'collected' ? 'gold' : 'ok'}>{STATUS_LABEL[b.status]}</Badge>{b.demo && <Badge tone="demo">Demo record</Badge>}</div>
        {b.status === 'collected' && <span className={cx('text-[13px] font-bold flex items-center gap-1 tnum', left <= 0 ? 'text-terra' : 'text-brand')}><Clock size={14} />{left > 0 ? `Return in ${left} day${left === 1 ? '' : 's'}` : left === 0 ? 'Return today by 6 PM' : `${-left} day${left === -1 ? '' : 's'} overdue`}</span>}
      </div>
      <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
        {b.items.map((it) => { const p = state.products.find((x) => x.id === it.productId)!; return (
          <a key={it.lineId} href={`#product-${p.id}`} className="flex gap-3 items-center min-w-[240px]"><span className="h-20 w-16 rounded-lg overflow-hidden shrink-0"><ProductImage p={p} /></span><span className="text-[13px]"><b className="block leading-snug">{p.name}</b><span className="text-muted">Size {it.size} · {it.days * 24}h{it.creditUsed ? ' · credit' : ''}</span></span></a>
        ); })}
      </div>
      <p className="text-[13px] text-muted mt-3">{fmtShort(b.items[0].start)} → {fmtShort(end)} · {b.pickupLocation.split(' · ')[0]} · {b.pickupSlot}</p>
      <div className="mt-4"><Timeline b={b} /></div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-tint px-3 py-1 font-semibold tnum">Deposit {inr(b.depositHeld)} · {b.status === 'refunded' ? `refunded ${inr(b.depositRefunded ?? 0)}` : b.status === 'cancelled' ? 'refunded' : 'held'}</span>
        {b.damage && <span className="rounded-full bg-terra/10 text-terra px-3 py-1 font-semibold">Damage: {b.damage.note} ({inr(b.damage.charge)})</span>}
        {b.extension && <span className="rounded-full bg-gold/20 px-3 py-1 font-semibold">Extension +{b.extension.days}d · {b.extension.status}</span>}
        {b.cancellationRequested && <span className="rounded-full bg-terra/10 text-terra px-3 py-1 font-semibold">Cancellation under review</span>}
      </div>
      {b.status !== 'cancelled' && !b.demo && (
        <div className="flex flex-wrap gap-2 mt-4">
          {ACTIVE_STATUSES.includes(b.status) && <Button size="sm" onClick={onPass}><QrCode size={15} />Pickup pass</Button>}
          {ACTIVE_STATUSES.includes(b.status) && !b.extension && <Button size="sm" variant="secondary" onClick={() => setExt(true)}><CalendarPlus size={15} />Request extension</Button>}
          {(b.status === 'reserved' || b.status === 'ready') && !b.cancellationRequested && <Button size="sm" variant="danger" onClick={() => { const r = actions.requestCancellation(b.id); toast(r.ok ? 'info' : 'err', r.ok ? (r.value === 'cancelled' ? 'Booking cancelled. Simulated refund issued and any credit restored.' : 'Late cancellation sent for review.') : r.error); }}><XCircle size={15} />Cancel</Button>}
          <Button size="sm" variant="ghost" onClick={onSupport}><LifeBuoy size={15} />Get help</Button>
        </div>
      )}
      <Modal open={ext} onClose={() => setExt(false)} title="Request an extension">
        <p className="text-[14px] text-muted">Extensions depend on whether another student has booked the same garment straight after you. {inr(state.policies.extensionPerDay)} per day per garment, charged only if approved.</p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          {[1, 2].map((d) => <Button key={d} variant="secondary" onClick={() => { const r = actions.requestExtension(b.id, d); toast(r.ok ? 'ok' : 'err', r.ok ? `Extension to ${fmtDate(addDays(end, d))} requested. The team will confirm.` : r.error); if (r.ok) setExt(false); }}>+{d} day{d > 1 ? 's' : ''} · {inr(d * state.policies.extensionPerDay * b.items.length)}</Button>)}
        </div>
      </Modal>
    </article>
  );
}

export default function Wardrobe() {
  const { state } = useStore();
  const toast = useToast();
  const [pass, setPass] = useState<Booking | null>(null);
  const [support, setSupport] = useState<Booking | null | 'general'>(null);
  const [msg, setMsg] = useState('');
  const mine = state.bookings.filter((b) => b.studentId === state.student.id);
  const upcoming = mine.filter((b) => b.status === 'reserved' || b.status === 'ready');
  const active = mine.filter((b) => b.status === 'collected');
  const done = mine.filter((b) => COMPLETED_STATUSES.includes(b.status) || b.status === 'cancelled');
  const sub = activeSubscription(state);
  const items = mine.filter((b) => b.status !== 'cancelled').flatMap((b) => b.items);
  const saved = items.reduce((a, it) => { const p = state.products.find((x) => x.id === it.productId); return a + (p ? p.retailPrice - (it.creditUsed ? 0 : it.rentalFee - it.discount) : 0); }, 0);
  const depositsHeld = mine.filter((b) => !['refunded', 'cancelled'].includes(b.status)).reduce((a, b) => a + b.depositHeld, 0);
  const wish = state.products.filter((p) => state.wishlist.includes(p.id) && !p.archived);
  const reuseOfMine = new Set(items.map((i) => i.unitId));
  const cycles = [...reuseOfMine].reduce((a, id) => a + (state.units.find((u) => u.id === id)?.rentalCycles ?? 0), 0);

  return (
    <div className="gutter max-w-[1280px] mx-auto pt-6 lg:pt-10">
      <p className="eyebrow text-brand">My Wardrobe</p>
      <h1 className="font-serif text-[40px] lg:text-[56px] font-semibold leading-none mt-2">Hello, {state.student.name.split(' ')[0]}.</h1>
      <p className="text-muted mt-2">{state.student.college}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <Stat label="Estimated money saved" value={inr(saved)} sub="vs buying at estimated retail" />
        <Stat label="Rentals booked" value={items.length} sub={`${upcoming.length} upcoming · ${active.length} active`} />
        <Stat label="Deposits held" value={inr(depositsHeld)} sub="refundable after return" />
        <Stat label="Garment reuse" value={cycles} sub="total wears logged on garments you rented" />
      </div>

      <div className="mt-6 rounded-2xl p-5 flex flex-wrap items-center gap-4 bg-forest text-ivory">
        <Ticket className="text-gold" />
        {sub ? (
          <><div className="flex-1 min-w-[200px]"><b className="font-serif text-[22px]">{planOf(state, sub.planId).name}</b><p className="text-ivory/70 text-[13px]">{creditsLeft(sub)} of {sub.creditsTotal} credits left · {sub.status === 'active' ? 'renews' : 'ends'} {fmtDate(sub.expiresAt)}</p></div><LinkButton href="#pass" variant="gold" size="sm">Manage pass</LinkButton></>
        ) : (
          <><div className="flex-1 min-w-[200px]"><b className="font-serif text-[22px]">No ReWear Pass yet</b><p className="text-ivory/70 text-[13px]">Monthly credits from ₹499 for students who rent more than once a month.</p></div><LinkButton href="#pass" variant="gold" size="sm">Compare plans</LinkButton></>
        )}
      </div>

      <Section title="Active rentals" icon={<Shirt size={18} />} count={active.length}>
        {active.length ? active.map((b) => <BookingCard key={b.id} b={b} onPass={() => setPass(b)} onSupport={() => setSupport(b)} />) : <p className="text-muted text-[14px]">Nothing out with you right now.</p>}
      </Section>
      <Section title="Upcoming rentals" icon={<Clock size={18} />} count={upcoming.length}>
        {upcoming.length ? upcoming.map((b) => <BookingCard key={b.id} b={b} onPass={() => setPass(b)} onSupport={() => setSupport(b)} />) : <Empty icon={<Shirt size={24} />} title="No upcoming rentals" body="Your next outfit is a few taps away." action={<LinkButton href="#explore">Explore the collection</LinkButton>} />}
      </Section>
      <Section title="Pop-up appointments" icon={<CalendarPlus size={18} />}><MyAppointments /></Section>
      <Section title="Rental history" icon={<Recycle size={18} />} count={done.length}>
        {done.length ? done.map((b) => <BookingCard key={b.id} b={b} onPass={() => setPass(b)} onSupport={() => setSupport(b)} />) : <p className="text-muted text-[14px]">Completed rentals will appear here.</p>}
      </Section>
      <Section title="Wishlist" icon={<Heart size={18} />} count={wish.length}>
        {wish.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 lg:gap-6">{wish.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} compact />)}</div> : <p className="text-muted text-[14px]">Tap the heart on any garment to save it here.</p>}
        {wish.length > 4 && <LinkButton href="#wishlist" variant="secondary" className="mt-4">See all {wish.length}</LinkButton>}
      </Section>
      <div className="mt-10 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => setSupport('general')}><LifeBuoy size={16} />Contact support</Button><LinkButton href="#feedback" variant="ghost"><Wallet size={16} />Share feedback on the pilot</LinkButton></div>

      <Modal open={!!pass} onClose={() => setPass(null)} title="Pickup pass">{pass && <PickupPass b={pass} />}</Modal>
      <Modal open={!!support} onClose={() => setSupport(null)} title="Customer support">
        <p className="text-[14px] text-muted mb-4">{support && support !== 'general' ? `About booking ${support.id}. ` : ''}During the pilot, support requests are answered by the founding team at the rack or by message.</p>
        <Field label="How can we help?" htmlFor="sup-msg"><textarea id="sup-msg" rows={4} className="field" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="For example: can I swap to a size M at pickup?" /></Field>
        <Button className="w-full mt-4" onClick={() => { if (msg.trim().length < 5) { toast('err', 'Describe the issue in a few words.'); return; } toast('ok', 'Support request logged (demo). The team would reply by message.'); setMsg(''); setSupport(null); }}>Send request</Button>
      </Modal>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-[26px] font-semibold flex items-center gap-2 mb-4"><span className="text-brand">{icon}</span>{title}{count !== undefined && <span className="text-[14px] font-sans text-muted font-semibold tnum">({count})</span>}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function WishlistPage() {
  const { state } = useStore();
  const wish = state.products.filter((p) => state.wishlist.includes(p.id) && !p.archived);
  return (
    <div className="gutter max-w-[1280px] mx-auto pt-6 lg:pt-10">
      <h1 className="font-serif text-[40px] lg:text-[56px] font-semibold">Wishlist</h1>
      <div className="mt-6">{wish.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-9 lg:gap-6">{wish.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <Empty icon={<Heart size={24} />} title="Nothing saved yet" body="Tap the heart on a garment to keep it for your next occasion." action={<LinkButton href="#explore">Explore the collection</LinkButton>} />}</div>
    </div>
  );
}
