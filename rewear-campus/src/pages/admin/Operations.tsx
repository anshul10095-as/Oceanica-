import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../store/store';
import { activeSubscription, planOf } from '../../store/rules';
import { Badge, Button, Field, Modal, Stat, useToast } from '../../components/ui';
import { addDays, cx, fmtDate, fmtShort, inr, todayISO } from '../../lib/util';
import type { Plan, PopupEvent, Policies } from '../../data/types';
import { AdminPanel } from './AdminShell';

// ---------------- Subscriptions ----------------
export function Members() {
  const { state, actions } = useStore();
  const toast = useToast();
  const t = todayISO();
  const subs = [...state.subscriptions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const active = subs.filter((s) => s.status !== 'expired' && s.expiresAt >= t);
  const revenue = state.payments.filter((p) => p.kind === 'subscription' && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const run = (r: { ok: boolean; error?: string }, m: string) => toast(r.ok ? 'ok' : 'err', r.ok ? m : (r as { error: string }).error);
  return (
    <AdminPanel title="Subscriptions" sub="ReWear Pass members, credits and renewals. Credits are tied to individual booking lines, so a credit can never be redeemed twice.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Active members" value={active.length} />
        <Stat label="Membership revenue" value={inr(revenue)} sub="all paid subscription payments" />
        <Stat label="Credits issued (active)" value={active.reduce((a, s) => a + s.creditsTotal, 0)} />
        <Stat label="Credits redeemed (active)" value={active.reduce((a, s) => a + s.creditsUsed, 0)} />
      </div>
      <h2 className="font-bold mt-8 mb-3">Plans</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {state.policies.plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex justify-between"><b>{p.name}</b><Button size="sm" variant="ghost" onClick={() => setPlan({ ...p })} aria-label={`Edit ${p.name}`}><Pencil size={14} /></Button></div>
            <p className="text-[13px] text-muted tnum">{inr(p.price)}/month · {p.credits} credits · {p.discount}% off extras{p.premiumAccess ? ' · premium access' : ''}</p>
            <p className="text-[12px] mt-2 tnum">{active.filter((s) => s.planId === p.id).length} active members</p>
          </div>
        ))}
      </div>
      <h2 className="font-bold mt-8 mb-3">Members</h2>
      <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
        <table className="w-full text-[13px] min-w-[760px]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="p-3">Membership</th><th className="p-3">Plan</th><th className="p-3">Credits</th><th className="p-3">Cycle</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>{subs.map((s) => (
            <tr key={s.id} className="border-b border-line last:border-0">
              <td className="p-3 tnum"><b>{s.id}</b>{s.demo ? <Badge tone="demo" className="ml-2">demo</Badge> : s.studentId === state.student.id ? <span className="block text-muted">{state.student.name}</span> : null}</td>
              <td className="p-3">{planOf(state, s.planId).name}</td>
              <td className="p-3 tnum">{s.creditsTotal - s.creditsUsed} left of {s.creditsTotal}</td>
              <td className="p-3 tnum">{fmtShort(s.startedAt)} → {fmtShort(s.expiresAt)}</td>
              <td className="p-3"><Badge tone={s.status === 'active' ? 'ok' : s.status === 'cancel-requested' ? 'warn' : 'neutral'}>{s.status === 'cancel-requested' ? 'Cancellation requested' : s.status === 'cancelled' ? 'Cancelled · runs to cycle end' : s.status}</Badge></td>
              <td className="p-3"><div className="flex justify-end gap-1 flex-wrap">
                {s.status === 'cancel-requested' && <Button size="sm" onClick={() => run(actions.adminSubscription(s.id, 'approve-cancel'), 'Cancellation approved')}>Approve cancel</Button>}
                {s.status !== 'expired' && <><Button size="sm" variant="ghost" onClick={() => run(actions.adminSubscription(s.id, 'add-credit'), 'Goodwill credit added')}>+1 credit</Button><Button size="sm" variant="ghost" onClick={() => run(actions.adminSubscription(s.id, 'extend'), 'Expiry extended by 7 days')}>+7 days</Button><Button size="sm" variant="ghost" onClick={() => run(actions.adminSubscription(s.id, 'expire'), 'Membership expired')}>Expire</Button></>}
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Modal open={!!plan} onClose={() => setPlan(null)} title={`Edit ${plan?.name ?? ''}`}>
        {plan && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹/month)" htmlFor="pl-p"><input id="pl-p" type="number" className="field" value={plan.price} onChange={(e) => setPlan({ ...plan, price: +e.target.value })} /></Field>
            <Field label="Credits per cycle" htmlFor="pl-c"><input id="pl-c" type="number" min={1} max={5} className="field" value={plan.credits} onChange={(e) => setPlan({ ...plan, credits: Math.max(1, Math.min(5, +e.target.value)) })} /></Field>
            <Field label="Extra-rental discount (%)" htmlFor="pl-d"><input id="pl-d" type="number" min={0} max={40} className="field" value={plan.discount} onChange={(e) => setPlan({ ...plan, discount: +e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-[13px] font-semibold mt-6"><input type="checkbox" className="accent-[#164B35]" checked={plan.premiumAccess} onChange={(e) => setPlan({ ...plan, premiumAccess: e.target.checked })} />Premium access</label>
            <p className="col-span-2 text-[12px] text-muted">Credits are capped at 5; unlimited plans are not supported. Changes apply to new cycles.</p>
            <Button className="col-span-2" onClick={() => { if (plan.price <= 0) { toast('err', 'Price must be positive.'); return; } actions.updatePolicies({ plans: state.policies.plans.map((p) => (p.id === plan.id ? plan : p)) }); toast('ok', 'Plan updated'); setPlan(null); }}>Save plan</Button>
          </div>
        )}
      </Modal>
      {activeSubscription(state) && <p className="text-[12px] text-muted mt-3">The demo student has an active pass.</p>}
    </AdminPanel>
  );
}

// ---------------- Pop-ups ----------------
export function PopupAdmin() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState<PopupEvent | null>(null);
  const [sel, setSel] = useState<string>(state.events[0]?.id ?? '');
  const ev = state.events.find((e) => e.id === sel);
  const appts = state.appointments.filter((a) => a.eventId === sel);
  const newEvent = (): PopupEvent => ({ id: `pu-${Date.now().toString(36).slice(-5)}`, name: '', theme: '', date: addDays(todayISO(), 14), start: '10:00 AM', end: '4:00 PM', location: 'Central block courtyard (proposed)', categories: ['Blazers'], productIds: [], slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM'].map((time) => ({ time, capacity: 3 })), tone: 'forest' });
  return (
    <AdminPanel title="Pop-ups" sub="Create campus pop-ups, assign garments, and manage fitting slots and reservations. Capacity cannot drop below existing bookings." actions={<Button onClick={() => setEdit(newEvent())}><Plus size={16} />New pop-up</Button>}>
      <div className="grid lg:grid-cols-[340px_1fr] gap-5">
        <ul className="space-y-2">
          {state.events.map((e) => {
            const n = state.appointments.filter((a) => a.eventId === e.id && a.status !== 'cancelled').length;
            const cap = e.slots.reduce((a, s) => a + s.capacity, 0);
            return <li key={e.id}><button onClick={() => setSel(e.id)} className={cx('w-full text-left rounded-xl border p-3', sel === e.id ? 'border-brand ring-1 ring-brand bg-surface' : 'border-line bg-surface')}><b className="block">{e.name}</b><span className="text-[12px] text-muted tnum">{fmtShort(e.date)} · {n}/{cap} slots booked · {e.productIds.length} garments</span></button></li>;
          })}
        </ul>
        {ev ? (
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap justify-between gap-2"><div><h2 className="text-[20px] font-bold">{ev.name}</h2><p className="text-[13px] text-muted">{fmtDate(ev.date, true)} · {ev.start}–{ev.end} · {ev.location}</p></div>
              <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setEdit(structuredClone(ev))}><Pencil size={14} />Edit</Button><Button size="sm" variant="danger" onClick={() => { const r = actions.deleteEvent(ev.id); toast(r.ok ? 'ok' : 'err', r.ok ? 'Pop-up deleted' : r.error); if (r.ok) setSel(state.events[0]?.id ?? ''); }}><Trash2 size={14} /></Button></div></div>
            <h3 className="font-semibold mt-5 mb-2">Fitting slots</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{ev.slots.map((s) => { const n = appts.filter((a) => a.slot === s.time && a.status !== 'cancelled').length; return <div key={s.time} className="rounded-lg bg-tint p-2.5 text-[13px] tnum"><b>{s.time}</b><span className="block text-muted">{n}/{s.capacity} booked</span><div className="h-1.5 rounded-full bg-line mt-1.5 overflow-hidden"><div className={cx('h-full', n >= s.capacity ? 'bg-terra' : 'bg-brand')} style={{ width: `${Math.min(100, (n / s.capacity) * 100)}%` }} /></div></div>; })}</div>
            <h3 className="font-semibold mt-5 mb-2">Reservations and pickups</h3>
            <div className="overflow-x-auto"><table className="w-full text-[13px] min-w-[520px]"><thead><tr className="text-left text-muted border-b border-line"><th className="py-2">ID</th><th>Slot</th><th>Type</th><th>Garment</th><th>Status</th><th /></tr></thead>
              <tbody>{appts.length ? appts.map((a) => <tr key={a.id} className="border-b border-line"><td className="py-2 tnum">{a.id}{a.demo && <Badge tone="demo" className="ml-1">demo</Badge>}</td><td>{a.slot}</td><td>{a.kind}</td><td>{a.productId ? `${state.products.find((p) => p.id === a.productId)?.name} (${a.size ?? '—'})` : '—'}</td><td><Badge tone={a.status === 'booked' ? 'ok' : 'neutral'}>{a.status}</Badge></td><td className="text-right">{a.status === 'booked' && <><Button size="sm" variant="ghost" onClick={() => actions.markAppointment(a.id, 'attended')}>Attended</Button><Button size="sm" variant="ghost" onClick={() => actions.markAppointment(a.id, 'cancelled')}>Cancel</Button></>}</td></tr>) : <tr><td colSpan={6} className="py-4 text-muted">No reservations yet.</td></tr>}</tbody></table></div>
          </div>
        ) : <p className="text-muted">No pop-ups yet.</p>}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit && state.events.some((e) => e.id === edit.id) ? 'Edit pop-up' : 'New pop-up'} wide footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => { if (!edit) return; const r = actions.upsertEvent(edit); toast(r.ok ? 'ok' : 'err', r.ok ? 'Pop-up saved' : r.error); if (r.ok) { setSel(edit.id); setEdit(null); } }}>Save pop-up</Button></div>}>
        {edit && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name" htmlFor="ev-n"><input id="ev-n" className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Theme" htmlFor="ev-t"><input id="ev-t" className="field" value={edit.theme} onChange={(e) => setEdit({ ...edit, theme: e.target.value })} /></Field>
            <Field label="Date" htmlFor="ev-d"><input id="ev-d" type="date" className="field" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
            <Field label="Proposed location" htmlFor="ev-l"><input id="ev-l" className="field" value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></Field>
            <Field label="Start" htmlFor="ev-s"><input id="ev-s" className="field" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} /></Field>
            <Field label="End" htmlFor="ev-e"><input id="ev-e" className="field" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Categories (comma separated)" htmlFor="ev-c"><input id="ev-c" className="field" value={edit.categories.join(', ')} onChange={(e) => setEdit({ ...edit, categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></Field></div>
            <fieldset className="sm:col-span-2"><legend className="text-[13px] font-semibold mb-2">Fitting slots and capacity</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{edit.slots.map((s, i) => <div key={i} className="flex gap-1"><input aria-label="Slot time" className="field !min-h-0 !py-2 text-[13px]" value={s.time} onChange={(e) => { const slots = [...edit.slots]; slots[i] = { ...s, time: e.target.value }; setEdit({ ...edit, slots }); }} /><input aria-label="Capacity" type="number" min={1} className="field !min-h-0 !py-2 w-16 text-[13px]" value={s.capacity} onChange={(e) => { const slots = [...edit.slots]; slots[i] = { ...s, capacity: Math.max(1, +e.target.value) }; setEdit({ ...edit, slots }); }} /></div>)}</div>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEdit({ ...edit, slots: [...edit.slots, { time: '5:00 PM', capacity: 3 }] })}><Plus size={14} />Add slot</Button>
            </fieldset>
            <fieldset className="sm:col-span-2"><legend className="text-[13px] font-semibold mb-2">Assign garments</legend>
              <div className="grid sm:grid-cols-2 gap-1 max-h-56 overflow-y-auto">{state.products.filter((p) => !p.archived).map((p) => <label key={p.id} className="flex items-center gap-2 text-[13px]"><input type="checkbox" className="accent-[#164B35]" checked={edit.productIds.includes(p.id)} onChange={(e) => setEdit({ ...edit, productIds: e.target.checked ? [...edit.productIds, p.id] : edit.productIds.filter((x) => x !== p.id) })} />{p.name}</label>)}</div>
            </fieldset>
          </div>
        )}
      </Modal>
    </AdminPanel>
  );
}

// ---------------- Cleaning and repair ----------------
export function Maintenance() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [costs, setCosts] = useState<Record<string, number>>({});
  const open = [...state.cleaning.filter((c) => c.status === 'in-progress').map((c) => ({ ...c, kind: 'cleaning' as const, note: '' })), ...state.repairs.filter((r) => r.status === 'in-progress').map((r) => ({ ...r, kind: 'repair' as const }))];
  const units = state.units.filter((u) => u.rentalCycles > 0 || u.status !== 'available').sort((a, b) => b.rentalCycles - a.rentalCycles);
  return (
    <AdminPanel title="Cleaning & repair" sub="A garment returns to the rack only after its cleaning record, and any repair, is completed. Marking it available directly is blocked.">
      <h2 className="font-bold mb-3">Open jobs ({open.length})</h2>
      <div className="rounded-2xl border border-line bg-surface overflow-x-auto mb-8">
        <table className="w-full text-[13px] min-w-[680px]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="p-3">Job</th><th className="p-3">Garment unit</th><th className="p-3">Started</th><th className="p-3">Cost (₹)</th><th className="p-3 text-right">Action</th></tr></thead>
          <tbody>
            {open.length ? open.map((j) => { const u = state.units.find((x) => x.id === j.unitId); const p = state.products.find((x) => x.id === u?.productId); return (
              <tr key={j.id} className="border-b border-line last:border-0">
                <td className="p-3"><Badge tone={j.kind === 'repair' ? 'bad' : 'warn'}>{j.kind}</Badge>{j.note && <span className="block text-muted mt-1">{j.note}</span>}</td>
                <td className="p-3"><b>{p?.name}</b><span className="block text-muted tnum">{j.unitId}</span></td>
                <td className="p-3 tnum">{fmtShort(j.date)}</td>
                <td className="p-3"><input aria-label="Cost" type="number" min={0} className="field !min-h-0 !py-1.5 w-24" value={costs[j.id] ?? j.cost} onChange={(e) => setCosts({ ...costs, [j.id]: +e.target.value })} /></td>
                <td className="p-3 text-right"><Button size="sm" onClick={() => { const c = costs[j.id] ?? j.cost; const r = j.kind === 'cleaning' ? actions.completeCleaning(j.id, c) : actions.completeRepair(j.id, c, j.note); toast(r.ok ? 'ok' : 'err', r.ok ? `${j.kind === 'cleaning' ? 'Cleaning' : 'Repair'} completed` : r.error); }}>Mark complete</Button></td>
              </tr>
            ); }) : <tr><td colSpan={5} className="p-6 text-center text-muted">No garments in cleaning or repair.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="font-bold mb-3">Garment maintenance tracker</h2>
      <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
        <table className="w-full text-[13px] min-w-[880px]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="p-3">Garment ID</th><th className="p-3">Garment</th><th className="p-3">Last cleaning</th><th className="p-3">Cleaning status</th><th className="p-3">Cleaning cost</th><th className="p-3">Repair status</th><th className="p-3">Repair cost</th><th className="p-3">Rental cycles</th><th className="p-3">Condition</th></tr></thead>
          <tbody>{units.slice(0, 60).map((u) => {
            const p = state.products.find((x) => x.id === u.productId);
            const cl = state.cleaning.filter((c) => c.unitId === u.id); const rp = state.repairs.filter((r) => r.unitId === u.id);
            return (
              <tr key={u.id} className="border-b border-line last:border-0 tnum">
                <td className="p-3">{u.id}</td><td className="p-3">{p?.name}</td><td className="p-3">{u.lastCleaned ? fmtShort(u.lastCleaned) : '—'}</td>
                <td className="p-3">{cl.some((c) => c.status === 'in-progress') ? <Badge tone="warn">In progress</Badge> : <Badge tone="ok">Clean</Badge>}</td>
                <td className="p-3">{inr(cl.reduce((a, c) => a + c.cost, 0))}</td>
                <td className="p-3">{rp.some((r) => r.status === 'in-progress') ? <Badge tone="bad">Under repair</Badge> : rp.length ? `${rp.length} done` : '—'}</td>
                <td className="p-3">{inr(rp.reduce((a, r) => a + r.cost, 0))}</td>
                <td className="p-3 font-bold">{u.rentalCycles}</td><td className="p-3">{u.condition}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <p className="text-[12px] text-muted mt-2">Showing units with rental history or open maintenance. Seeded demo records are included.</p>
    </AdminPanel>
  );
}

// ---------------- Policies ----------------
export function SettingsPage() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [p, setP] = useState<Policies>(state.policies);
  const num = (k: keyof Policies, label: string, hint?: string) => (
    <Field label={label} hint={hint} htmlFor={`pol-${k}`}><input id={`pol-${k}`} type="number" min={0} className="field" value={p[k] as number} onChange={(e) => setP({ ...p, [k]: Math.max(0, +e.target.value) })} /></Field>
  );
  return (
    <AdminPanel title="Policies & pricing" sub="Every proposed charge and booking rule is configurable here and applies immediately across the student app.">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 rounded-2xl border border-line bg-surface p-5">
        {num('leadDays', 'Minimum notice (days)', 'Earliest pickup is today plus this many days')}
        {num('maxAdvanceDays', 'Booking window (days)')}
        {num('bufferDays', 'Cleaning buffer (days)', 'Held after each return before the next pickup')}
        {num('surcharge72', '72-hour surcharge (₹)')}
        {num('extensionPerDay', 'Extension fee per day (₹)')}
        {num('freeCancelHours', 'Free cancellation window (hours)')}
        {num('cleaningCost', 'Default cleaning cost per cycle (₹)')}
        <div className="md:col-span-2 xl:col-span-3"><Field label="Pickup racks (one per line)" htmlFor="pol-loc"><textarea id="pol-loc" rows={3} className="field" value={p.pickupLocations.join('\n')} onChange={(e) => setP({ ...p, pickupLocations: e.target.value.split('\n') })} /></Field></div>
        <div className="md:col-span-2 xl:col-span-3"><Field label="Pickup slots (one per line)" htmlFor="pol-sl"><textarea id="pol-sl" rows={4} className="field" value={p.pickupSlots.join('\n')} onChange={(e) => setP({ ...p, pickupSlots: e.target.value.split('\n') })} /></Field></div>
      </div>
      <div className="flex gap-3 mt-4">
        <Button onClick={() => { const clean = { ...p, pickupLocations: p.pickupLocations.map((s) => s.trim()).filter(Boolean), pickupSlots: p.pickupSlots.map((s) => s.trim()).filter(Boolean) }; if (!clean.pickupLocations.length || !clean.pickupSlots.length) { toast('err', 'Keep at least one rack and one slot.'); return; } actions.updatePolicies(clean); toast('ok', 'Policies saved'); }}>Save policies</Button>
        <Button variant="secondary" onClick={() => setP(state.policies)}>Discard changes</Button>
      </div>
      <p className="text-[12px] text-muted mt-3">Garment rental prices and deposits are edited per garment in Inventory. Plan prices are edited in Subscriptions.</p>
    </AdminPanel>
  );
}
