import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../../store/store';
import { bookingEnd, STATUS_LABEL } from '../../store/rules';
import { Badge, Button, Field, Modal, useToast } from '../../components/ui';
import { cx, fmtDate, fmtShort, inr } from '../../lib/util';
import type { Booking, BookingStatus, Condition } from '../../data/types';
import { Timeline } from '../Wardrobe';
import { AdminPanel } from './AdminShell';

const TABS: [string, BookingStatus[] | null][] = [['Open', ['reserved', 'ready', 'collected', 'returned', 'qc']], ['Reserved', ['reserved']], ['Ready', ['ready']], ['Out', ['collected']], ['Returns & QC', ['returned', 'qc']], ['Closed', ['refunded', 'cancelled']], ['All', null]];

export default function Rentals() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [qc, setQc] = useState<Booking | null>(null);
  const [qcForm, setQcForm] = useState({ condition: 'Excellent' as Condition, damageNote: '', charge: 0, repair: false });
  const [showDemo, setShowDemo] = useState(true);
  const statuses = TABS[tab][1];
  const list = state.bookings.filter((b) => (!statuses || statuses.includes(b.status)) && (showDemo || !b.demo) && (!q || `${b.id} ${b.contact.name}`.toLowerCase().includes(q.toLowerCase())));
  const run = (r: { ok: boolean; error?: string }, msg: string) => toast(r.ok ? 'ok' : 'err', r.ok ? msg : (r as { error: string }).error);

  return (
    <AdminPanel title="Rentals" sub="Move each booking through pickup, return, quality check and deposit refund. Each step is validated, so a booking cannot skip ahead.">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-full bg-tint p-1">{TABS.map(([l], i) => <button key={l} onClick={() => setTab(i)} className={cx('h-9 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap', tab === i ? 'bg-surface shadow-sm' : 'text-muted')}>{l}</button>)}</div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking ID or name" aria-label="Search bookings" className="field !min-h-0 !py-2 max-w-[240px]" />
        <label className="flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" className="accent-[#164B35]" checked={showDemo} onChange={(e) => setShowDemo(e.target.checked)} />Show seeded demo records</label>
      </div>
      <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
        {list.length === 0 && <p className="p-8 text-center text-muted">No bookings in this view.</p>}
        {list.map((b) => {
          const isOpen = open === b.id;
          const items = b.items.map((it) => ({ it, p: state.products.find((p) => p.id === it.productId)! }));
          return (
            <div key={b.id}>
              <button onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen} className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[150px_1fr_130px_150px_24px] gap-x-4 gap-y-1 items-center p-4 text-left text-[13px] hover:bg-tint/50">
                <span className="font-bold tnum">{b.id}{b.demo && <Badge tone="demo" className="ml-2">demo</Badge>}</span>
                <span className="truncate md:order-none">{b.contact.name} · {items.map((x) => x.p.name).join(', ')}</span>
                <span className="text-muted tnum">{fmtShort(b.items[0].start)} → {fmtShort(bookingEnd(b))}</span>
                <span className="flex gap-1 flex-wrap"><Badge tone={b.status === 'cancelled' ? 'bad' : b.status === 'collected' ? 'gold' : 'ok'}>{STATUS_LABEL[b.status]}</Badge>{(b.extension?.status === 'requested' || b.cancellationRequested) && <Badge tone="warn">Request</Badge>}</span>
                <ChevronDown size={18} className={cx('hidden md:block transition', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 grid lg:grid-cols-[1.3fr_1fr] gap-6 anim-fade">
                  <div>
                    <Timeline b={b} />
                    <table className="w-full text-[13px] mt-4 tnum"><tbody>
                      {items.map(({ it, p }) => <tr key={it.lineId} className="border-b border-line"><td className="py-2">{p.name} <span className="text-muted">({it.size})</span><br /><span className="text-muted text-[12px]">Unit {it.unitId}</span></td><td>{it.days * 24}h</td><td className="text-right">{it.creditUsed ? 'Credit' : inr(it.rentalFee - it.discount)}</td></tr>)}
                    </tbody></table>
                    <dl className="grid grid-cols-3 gap-2 mt-3 text-[12px] tnum">
                      <div className="rounded-lg bg-tint p-2"><dt className="text-muted">Rental revenue</dt><dd className="font-bold">{inr(b.rentalPaid)}</dd></div>
                      <div className="rounded-lg bg-tint p-2"><dt className="text-muted">Deposit held</dt><dd className="font-bold">{inr(b.depositHeld)}</dd></div>
                      <div className="rounded-lg bg-tint p-2"><dt className="text-muted">Credits</dt><dd className="font-bold">{b.creditsRedeemed}</dd></div>
                    </dl>
                    <p className="text-[12px] text-muted mt-3">{b.pickupLocation} · {b.pickupSlot} · {b.paymentMethod === 'pickup' ? 'Pay at pickup' : b.paymentMethod.toUpperCase() + ' (simulated)'} · {b.contact.phone} · {b.contact.email}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {b.status === 'reserved' && <Button size="sm" onClick={() => run(actions.advance(b.id, 'ready'), `${b.id} confirmed and marked ready for pickup`)}>Confirm · mark ready</Button>}
                      {b.status === 'ready' && <Button size="sm" onClick={() => run(actions.advance(b.id, 'collected'), `${b.id} marked collected`)}>Mark collected</Button>}
                      {b.status === 'collected' && <Button size="sm" onClick={() => run(actions.processReturn(b.id), `Return processed. Garments sent to cleaning.`)}>Process return</Button>}
                      {b.status === 'returned' && <Button size="sm" onClick={() => { setQc(b); setQcForm({ condition: 'Excellent', damageNote: '', charge: 0, repair: false }); }}>Quality check</Button>}
                      {b.status === 'qc' && <Button size="sm" onClick={() => run(actions.refundDeposit(b.id), `Simulated refund of ${inr(b.depositHeld - (b.damage?.charge ?? 0))} approved`)}>Approve deposit refund · {inr(b.depositHeld - (b.damage?.charge ?? 0))}</Button>}
                      {(b.status === 'reserved' || b.status === 'ready') && <Button size="sm" variant="danger" onClick={() => run(actions.adminCancel(b.id), `${b.id} cancelled and refunded`)}>{b.cancellationRequested ? 'Approve cancellation' : 'Cancel booking'}</Button>}
                    </div>
                    {b.extension?.status === 'requested' && (
                      <div className="rounded-xl border border-gold/60 bg-gold/10 p-3 text-[13px]"><b>Extension request:</b> +{b.extension.days} day(s), fee {inr(b.extension.fee)}<div className="flex gap-2 mt-2"><Button size="sm" onClick={() => run(actions.adminExtension(b.id, true), 'Extension approved')}>Approve</Button><Button size="sm" variant="secondary" onClick={() => run(actions.adminExtension(b.id, false), 'Extension declined')}>Decline</Button></div></div>
                    )}
                    {b.damage && <p className="text-[12px] rounded-lg bg-terra/10 text-terra p-2">Damage recorded: {b.damage.note} · {inr(b.damage.charge)} retained</p>}
                    <div><p className="text-[12px] font-bold text-muted mb-1">History</p><ul className="text-[12px] space-y-1 max-h-40 overflow-y-auto">{b.history.slice().reverse().map((h, i) => <li key={i} className="flex gap-2"><span className="text-muted tnum shrink-0">{h.at.slice(0, 10)}</span><span><b>{h.status === 'note' ? 'Note' : STATUS_LABEL[h.status]}</b>{h.note ? ` · ${h.note}` : ''}</span></li>)}</ul></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Modal open={!!qc} onClose={() => setQc(null)} title={`Quality check · ${qc?.id ?? ''}`}>
        {qc && (
          <div className="space-y-4">
            <Field label="Garment condition after return" htmlFor="qc-c"><select id="qc-c" className="field" value={qcForm.condition} onChange={(e) => setQcForm({ ...qcForm, condition: e.target.value as Condition })}>{['Like new', 'Excellent', 'Very good', 'Good'].map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Damage note" hint="Leave blank if there is no damage beyond normal wear" htmlFor="qc-n"><input id="qc-n" className="field" value={qcForm.damageNote} onChange={(e) => setQcForm({ ...qcForm, damageNote: e.target.value })} placeholder="e.g. Loose button on left cuff" /></Field>
            <Field label={`Damage charge (max ${inr(qc.depositHeld)})`} htmlFor="qc-ch"><input id="qc-ch" type="number" min={0} max={qc.depositHeld} className="field" value={qcForm.charge} onChange={(e) => setQcForm({ ...qcForm, charge: Math.max(0, +e.target.value) })} /></Field>
            <label className="flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" className="accent-[#164B35] h-4 w-4" checked={qcForm.repair} onChange={(e) => setQcForm({ ...qcForm, repair: e.target.checked })} />Send garments for repair</label>
            <p className="text-[12px] text-muted">Garments stay unavailable until their cleaning (and any repair) is completed in Cleaning & repair.</p>
            <Button className="w-full" onClick={() => { const r = actions.qualityCheck(qc.id, qcForm); run(r, 'Quality check recorded'); if (r.ok) setQc(null); }}>Record quality check</Button>
            <p className="text-[12px] text-muted">Returned on {qc.returnedAt ? fmtDate(qc.returnedAt) : '—'}</p>
          </div>
        )}
      </Modal>
    </AdminPanel>
  );
}
