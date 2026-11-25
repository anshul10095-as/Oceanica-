import { useMemo, useState } from 'react';
import { MapPin, Clock, CalendarDays, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, CalendarX } from 'lucide-react';
import { useStore } from '../store/store';
import { useRouter } from '../lib/router';
import { GarmentArt } from '../components/GarmentArt';
import { ProductCard } from '../components/Product';
import { Badge, Button, DemoNote, Empty, LinkButton, Modal, SectionHead, useToast } from '../components/ui';
import { cx, fmtDate, fmtShort, parseISO, toISO, todayISO } from '../lib/util';
import type { Appointment, AppState, PopupEvent } from '../data/types';

const TONES: Record<PopupEvent['tone'], string> = { forest: '#164B35', terra: '#A65A3D', gold: '#8A6A2E', sage: '#5E7A5B', ink: '#202420' };

export function EventArt({ e, className }: { e: PopupEvent; className?: string }) {
  const { state } = useStore();
  const ps = e.productIds.map((id) => state.products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
  return (
    <div className={cx('relative overflow-hidden', className)} style={{ background: TONES[e.tone] }}>
      <div className="absolute inset-0 paper opacity-50" />
      <div className="absolute inset-x-[7%] top-[14%] h-[5px] rounded-full bg-gradient-to-b from-[#e7cf98] to-[#a98a4c]" />
      <div className="absolute left-[7%] top-[14%] bottom-0 w-[4px] bg-[#a98a4c]/80" /><div className="absolute right-[7%] top-[14%] bottom-0 w-[4px] bg-[#a98a4c]/80" />
      <div className="absolute inset-x-[9%] top-[12%] bottom-[2%] grid grid-cols-4">
        {ps.map((p) => <GarmentArt key={p!.id} kind={p!.art} color={p!.hex} accent={p!.accent} backdrop={false} className="w-full h-full" />)}
      </div>
    </div>
  );
}

function slotsFor(state: AppState, e: PopupEvent) {
  return e.slots.map((s) => {
    const taken = state.appointments.filter((a) => a.eventId === e.id && a.slot === s.time && a.status !== 'cancelled').length;
    return { ...s, taken, left: Math.max(0, s.capacity - taken) };
  });
}

function EventCalendar({ events }: { events: PopupEvent[] }) {
  const [cursor, setCursor] = useState(() => { const d = parseISO(todayISO()); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const byDate = Object.fromEntries(events.map((e) => [e.date, e]));
  const offset = (cursor.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(cursor); d.setDate(1 - offset + i); return d; });
  const t = todayISO();
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-tint" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <p className="font-semibold">{cursor.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
        <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-tint" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-muted font-semibold">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <span key={d} className="py-1">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const iso = toISO(d); const e = byDate[iso];
          const inner = <><span className="tnum">{d.getDate()}</span>{e && <span className="hidden sm:block text-[9.5px] leading-tight font-bold truncate w-full px-0.5">{e.name.replace(' Pop-Up', '')}</span>}</>;
          const cls = cx('min-h-[46px] sm:min-h-[64px] rounded-lg flex flex-col items-center justify-start pt-1.5 text-[12px] gap-0.5', d.getMonth() !== cursor.getMonth() && 'opacity-35', iso === t && 'ring-1 ring-terra');
          return e
            ? <a key={iso} href={`#popup-${e.id}`} className={cx(cls, 'text-white font-semibold hover:brightness-110')} style={{ background: TONES[e.tone] }} aria-label={`${e.name}, ${fmtDate(iso)}`}>{inner}</a>
            : <div key={iso} className={cls}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

export function MyAppointments() {
  const { state, actions } = useStore();
  const toast = useToast();
  const mine = state.appointments.filter((a) => a.studentId === state.student.id && a.status === 'booked').sort((a, b) => (state.events.find((e) => e.id === a.eventId)?.date ?? '').localeCompare(state.events.find((e) => e.id === b.eventId)?.date ?? ''));
  if (!mine.length) return <p className="text-[14px] text-muted rounded-xl border border-dashed border-line p-5">No pop-up appointments yet. Book a fitting at any upcoming pop-up.</p>;
  return (
    <ul className="space-y-3">
      {mine.map((a) => { const e = state.events.find((x) => x.id === a.eventId); const p = state.products.find((x) => x.id === a.productId); if (!e) return null; return (
        <li key={a.id} className="rounded-xl border border-line bg-surface p-4 flex flex-wrap items-center gap-3">
          <span className="h-11 w-11 rounded-full grid place-items-center text-white shrink-0" style={{ background: TONES[e.tone] }}><CalendarDays size={18} /></span>
          <div className="flex-1 min-w-[180px] text-[14px]"><b>{e.name}</b><p className="text-muted text-[13px]">{a.kind === 'fitting' ? 'Fitting appointment' : 'Pickup reservation'} · {fmtShort(e.date)}, {a.slot}{p ? ` · ${p.name} (${a.size})` : ''}</p><p className="text-[12px] text-muted tnum">{a.id}</p></div>
          <Button size="sm" variant="danger" onClick={() => { const r = actions.cancelAppointment(a.id); toast(r.ok ? 'info' : 'err', r.ok ? 'Appointment cancelled' : r.error); }}>Cancel</Button>
        </li>
      ); })}
    </ul>
  );
}

export function PopupsPage() {
  const { state } = useStore();
  const t = todayISO();
  const upcoming = state.events.filter((e) => e.date >= t);
  return (
    <div>
      <section className="gutter max-w-[1440px] mx-auto pt-8 lg:pt-12 grid lg:grid-cols-2 gap-8 items-end">
        <div>
          <p className="eyebrow text-brand mb-3">ReWear Pop-Up</p>
          <h1 className="font-serif text-[46px] lg:text-[72px] font-semibold leading-[0.95]">The rack comes <span className="italic">to campus.</span></h1>
          <p className="text-muted mt-4 max-w-[52ch] text-[16px]">Browse the collection in person, book a fitting slot, and collect reserved outfits. Every online booking is picked up from one of these racks.</p>
        </div>
        <DemoNote className="lg:justify-self-end max-w-md">Demonstration events. Campus locations and schedules are illustrative until approved and confirmed. ReWear Campus is a student venture and is not an official university service.</DemoNote>
      </section>
      <section className="gutter max-w-[1440px] mx-auto mt-10 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        <div className="space-y-4">
          {upcoming.length ? upcoming.map((e) => <EventRow key={e.id} e={e} />) : <Empty icon={<CalendarX size={24} />} title="No pop-ups scheduled" body="New pop-ups will appear here once they are confirmed." />}
        </div>
        <div className="space-y-6 lg:sticky lg:self-start" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 96px)' }}>
          <EventCalendar events={state.events} />
          <div><h2 className="font-serif text-[24px] font-semibold mb-3">Your appointments</h2><MyAppointments /></div>
        </div>
      </section>
    </div>
  );
}

function EventRow({ e }: { e: PopupEvent }) {
  const { state } = useStore();
  const slots = slotsFor(state, e);
  const left = slots.reduce((a, s) => a + s.left, 0);
  return (
    <a href={`#popup-${e.id}`} className="group grid sm:grid-cols-[220px_1fr] rounded-2xl overflow-hidden border border-line bg-surface hover:shadow-lift transition">
      <EventArt e={e} className="aspect-[16/9] sm:aspect-auto sm:min-h-[200px]" />
      <div className="p-5 flex flex-col">
        <div className="flex flex-wrap gap-2 items-center"><Badge tone="brand">{fmtShort(e.date)}</Badge><span className="text-[13px] text-muted flex items-center gap-1"><Clock size={14} />{e.start} – {e.end}</span></div>
        <h2 className="font-serif text-[28px] font-semibold mt-2 leading-tight">{e.name}</h2>
        <p className="text-muted text-[14px]">{e.theme}</p>
        <p className="text-[13px] text-muted mt-2 flex items-center gap-1.5"><MapPin size={14} />{e.location}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">{e.categories.map((c) => <Badge key={c}>{c}</Badge>)}</div>
        <div className="mt-4 flex items-center justify-between"><span className={cx('text-[13px] font-semibold tnum', left < 5 ? 'text-terra' : 'text-brand')}>{left} of {slots.reduce((a, s) => a + s.capacity, 0)} fitting slots left · {e.productIds.length} garments</span><span className="inline-flex items-center gap-1 text-[14px] font-semibold group-hover:text-brand">View <ArrowRight size={15} /></span></div>
      </div>
    </a>
  );
}

export function PopupDetail() {
  const { route } = useRouter();
  const { state, actions } = useStore();
  const toast = useToast();
  const e = state.events.find((x) => x.id === route.arg);
  const [slot, setSlot] = useState<string | null>(null);
  const [kind, setKind] = useState<'fitting' | 'pickup'>('fitting');
  const [productId, setProductId] = useState('');
  const [size, setSize] = useState('');
  const [done, setDone] = useState<Appointment | null>(null);
  const slots = e ? slotsFor(state, e) : [];
  const products = useMemo(() => (e ? e.productIds.map((id) => state.products.find((p) => p.id === id)!).filter((p) => p && !p.archived) : []), [e, state.products]);
  if (!e) return <div className="gutter max-w-3xl mx-auto py-12"><Empty icon={<CalendarX size={24} />} title="Pop-up not found" body="It may have been removed by the team." action={<LinkButton href="#popups">All pop-ups</LinkButton>} /></div>;
  const past = e.date < todayISO();
  const prod = products.find((p) => p.id === productId);
  const book = () => {
    if (!slot) { toast('err', 'Choose a time slot.'); return; }
    if (kind === 'pickup' && (!productId || !size)) { toast('err', 'Choose the garment and size to reserve.'); return; }
    const r = actions.bookAppointment(e.id, slot, kind, kind === 'pickup' ? productId : productId || undefined, size || undefined);
    if (!r.ok) { toast('err', r.error); return; }
    setDone(r.value); setSlot(null);
  };
  return (
    <div>
      <EventArt e={e} className="h-[260px] lg:h-[380px]" />
      <div className="gutter max-w-[1440px] mx-auto">
        <div className="-mt-16 relative bg-bg rounded-t-[24px] pt-6 lg:pt-8 grid lg:grid-cols-[1fr_420px] gap-10">
          <div>
            <a href="#popups" className="text-[13px] text-muted hover:text-fg">← All pop-ups</a>
            <h1 className="font-serif text-[42px] lg:text-[62px] font-semibold leading-none mt-3">{e.name}</h1>
            <p className="text-muted text-[16px] mt-3">{e.theme}</p>
            <dl className="grid sm:grid-cols-3 gap-3 mt-6 text-[14px]">
              <div className="rounded-xl bg-tint p-4"><dt className="text-muted text-[12px] font-semibold flex items-center gap-1"><CalendarDays size={14} />Date</dt><dd className="font-semibold mt-1">{fmtDate(e.date, true)}</dd></div>
              <div className="rounded-xl bg-tint p-4"><dt className="text-muted text-[12px] font-semibold flex items-center gap-1"><Clock size={14} />Time</dt><dd className="font-semibold mt-1">{e.start} – {e.end}</dd></div>
              <div className="rounded-xl bg-tint p-4"><dt className="text-muted text-[12px] font-semibold flex items-center gap-1"><MapPin size={14} />Proposed location</dt><dd className="font-semibold mt-1">{e.location}</dd></div>
            </dl>
            <DemoNote className="mt-3">Location and schedule are illustrative until approved and confirmed.</DemoNote>
            <SectionHead className="mt-12" eyebrow="On the rack" title="Browse this collection" sub={`Available categories: ${e.categories.join(', ')}.`} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 lg:gap-6">{products.map((p) => <ProductCard key={p.id} p={p} compact />)}</div>
          </div>
          <aside className="lg:sticky lg:self-start" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 96px)' }}>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-serif text-[26px] font-semibold">Reserve a slot</h2>
              {past ? <p className="text-muted text-[14px] mt-2">This pop-up has already taken place.</p> : (
                <>
                  <div className="grid grid-cols-2 gap-2 mt-4" role="radiogroup" aria-label="Appointment type">
                    {([['fitting', 'Fitting appointment'], ['pickup', 'Reserve and pick up']] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cx('rounded-xl border p-3 text-[13px] font-semibold text-left', kind === k ? 'border-brand ring-1 ring-brand bg-tint' : 'border-line')}>{l}</button>)}
                  </div>
                  <label className="block mt-4 text-[13px] font-semibold">Garment {kind === 'fitting' && <span className="text-muted font-normal">(optional)</span>}
                    <select className="field mt-1.5" value={productId} onChange={(ev) => { setProductId(ev.target.value); setSize(''); }}><option value="">{kind === 'fitting' ? 'Browse on the day' : 'Choose a garment'}</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · ₹{p.rentalPrice}</option>)}</select>
                  </label>
                  {prod && <label className="block mt-3 text-[13px] font-semibold">Size<select className="field mt-1.5" value={size} onChange={(ev) => setSize(ev.target.value)}><option value="">Choose size</option>{prod.sizes.map((s) => <option key={s}>{s}</option>)}</select></label>}
                  <p className="text-[13px] font-semibold mt-4 mb-2">{kind === 'fitting' ? 'Fitting slot' : 'Pickup slot'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => (
                      <button key={s.time} disabled={!s.left} onClick={() => setSlot(s.time)} aria-pressed={slot === s.time} className={cx('rounded-xl border p-2.5 text-left transition', slot === s.time ? 'bg-brand text-onbrand border-brand' : 'border-line hover:border-fg/40', !s.left && 'opacity-40 cursor-not-allowed')}>
                        <span className="block font-semibold text-[14px] tnum">{s.time}</span><span className="text-[11px] opacity-80 tnum">{s.left ? `${s.left} of ${s.capacity} left` : 'Full'}</span>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-5" size="lg" onClick={book}>Confirm {kind === 'fitting' ? 'fitting' : 'reservation'}</Button>
                  {kind === 'pickup' && <p className="text-[12px] text-muted mt-2">Pay rental and deposit at the rack. To pay now, rent from the garment page and choose this rack at checkout.</p>}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Modal open={!!done} onClose={() => setDone(null)} title="Appointment confirmed">
        {done && (
          <div className="text-center py-2">
            <span className="h-14 w-14 rounded-full bg-tint text-brand grid place-items-center mx-auto"><CheckCircle2 size={28} /></span>
            <p className="font-serif text-[28px] font-semibold mt-4">{e.name}</p>
            <p className="text-muted">{fmtDate(e.date, true)} · {done.slot}</p>
            <p className="text-[13px] mt-2">{done.kind === 'fitting' ? 'Fitting appointment' : 'Pickup reservation'}{done.productId ? ` · ${state.products.find((p) => p.id === done.productId)?.name}${done.size ? ` (${done.size})` : ''}` : ''}</p>
            <p className="mt-4 inline-block rounded-full border border-dashed border-terra/60 text-terra text-[12px] font-bold px-3 py-1 tnum">{done.id} · DEMO CONFIRMATION</p>
            <div className="flex gap-2 justify-center mt-6"><LinkButton href="#wardrobe">View in My Wardrobe</LinkButton><Button variant="secondary" onClick={() => setDone(null)}>Done</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
