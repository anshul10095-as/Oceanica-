import { useMemo, useState } from 'react';
import { Plus, Pencil, Archive, ArchiveRestore, ImageIcon } from 'lucide-react';
import { useStore } from '../../store/store';
import { ProductImage } from '../../components/Product';
import { Badge, Button, Field, Modal, useToast } from '../../components/ui';
import { RentalCalendar } from '../../components/Calendar';
import { ACTIVE_STATUSES } from '../../store/rules';
import { addDays, cx, inr, todayISO } from '../../lib/util';
import type { ArtKind, Condition, Occasion, Product, UnitStatus } from '../../data/types';
import { OCCASIONS } from '../../data/catalogue';
import { AdminPanel } from './AdminShell';

const ARTS: ArtKind[] = ['blazer', 'blazer-w', 'shirt', 'shirt-w', 'trousers', 'trousers-w', 'suit', 'pantsuit', 'interview-set', 'corporate-set', 'kurta', 'kurta-embroidered', 'sherwani', 'nehru', 'ethnic-set-m', 'bandhgala', 'saree', 'anarkali', 'kurta-w', 'dress', 'lehenga', 'occasion-set-w', 'coord-w'];
const blank = (): Product => ({ id: `rw-new-${Date.now().toString(36).slice(-4)}`, name: '', gender: 'men', line: 'formal', category: 'Blazer', tier: 'standard', eliteEligible: false, art: 'blazer', color: 'Navy', hex: '#1f2f4d', accent: '#f4f2ec', colorFamily: 'Blue', rentalPrice: 399, retailPrice: 2500, deposit: 1000, sizes: ['S', 'M', 'L'], measurements: { S: [], M: [], L: [] }, occasions: ['placements'], fabric: '', condition: 'Like new', styling: [], care: 'Professionally cleaned between rentals.', addedOn: todayISO(), popularity: 50, blockedDates: [], archived: false });

export default function Inventory() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [units, setUnits] = useState<Product | null>(null);
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const list = state.products.filter((p) => (showArchived || !p.archived) && (!q || `${p.name} ${p.id} ${p.category}`.toLowerCase().includes(q.toLowerCase())));
  const busyUnits = useMemo(() => new Set(state.bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).flatMap((b) => b.items.map((i) => i.unitId))), [state.bookings]);

  const save = () => {
    if (!edit) return;
    const sizes = edit.sizes.map((s) => s.trim()).filter(Boolean);
    const measurements = Object.fromEntries(sizes.map((s) => [s, edit.measurements[s] ?? []]));
    const r = actions.upsertProduct({ ...edit, sizes, measurements });
    toast(r.ok ? 'ok' : 'err', r.ok ? `${edit.name} saved` : r.error);
    if (r.ok) setEdit(null);
  };

  return (
    <AdminPanel title="Inventory" sub="Garments and their physical units. Garments with active bookings cannot be archived, and their sizes cannot be removed." actions={<Button onClick={() => { setEdit(blank()); setIsNew(true); }}><Plus size={16} />Add garment</Button>}>
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search garments" aria-label="Search garments" className="field !min-h-0 !py-2 max-w-[260px]" />
        <label className="flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" className="accent-[#164B35]" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />Show archived</label>
        <span className="text-[13px] text-muted ml-auto tnum">{state.units.filter((u) => u.status !== 'retired').length} units · {state.products.filter((p) => !p.archived).length} garments</span>
      </div>
      <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
        <table className="w-full text-[13px] min-w-[860px]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="p-3">Garment</th><th className="p-3">Rental / 48h</th><th className="p-3">Deposit</th><th className="p-3">Sizes</th><th className="p-3">Units (free · cleaning · repair)</th><th className="p-3">Condition</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {list.map((p) => {
              const us = state.units.filter((u) => u.productId === p.id && u.status !== 'retired');
              const c = (s: UnitStatus) => us.filter((u) => u.status === s).length;
              return (
                <tr key={p.id} className={cx('border-b border-line last:border-0', p.archived && 'opacity-50')}>
                  <td className="p-3"><div className="flex items-center gap-3"><span className="h-14 w-11 rounded-md overflow-hidden shrink-0"><ProductImage p={p} /></span><span><b className="block">{p.name}</b><span className="text-muted">{p.id} · {p.category} · {p.tier}</span></span></div></td>
                  <td className="p-3 font-semibold tnum">{inr(p.rentalPrice)}<span className="block text-muted font-normal">retail {inr(p.retailPrice)}</span></td>
                  <td className="p-3 tnum">{inr(p.deposit)}</td>
                  <td className="p-3">{p.sizes.join(', ')}</td>
                  <td className="p-3 tnum"><span className="text-brand font-bold">{c('available')}</span> · <span className="text-[#a46b12]">{c('cleaning')}</span> · <span className="text-terra">{c('repair')}</span> <span className="text-muted">of {us.length}</span></td>
                  <td className="p-3">{p.condition}{p.blockedDates.length > 0 && <Badge tone="warn" className="ml-1">{p.blockedDates.length} blocked</Badge>}</td>
                  <td className="p-3"><div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setUnits(p)}>Units</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEdit(structuredClone(p)); setIsNew(false); }} aria-label={`Edit ${p.name}`}><Pencil size={15} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { const r = actions.archiveProduct(p.id, !p.archived); toast(r.ok ? 'ok' : 'err', r.ok ? (p.archived ? 'Restored to catalogue' : 'Archived') : r.error); }} aria-label={p.archived ? 'Restore' : 'Archive'}>{p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</Button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={isNew ? 'Add garment' : 'Edit garment'} wide footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save garment</Button></div>}>
        {edit && (
          <div className="grid md:grid-cols-[200px_1fr] gap-6">
            <div><div className="rounded-xl overflow-hidden aspect-[3/4] bg-tint"><ProductImage p={edit} /></div><p className="text-[11px] text-muted mt-2">Preview. A photo URL replaces the illustration; a broken URL falls back to it.</p></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Field label="Name" htmlFor="e-name"><input id="e-name" className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field></div>
              <Field label="Fit" htmlFor="e-g"><select id="e-g" className="field" value={edit.gender} onChange={(e) => setEdit({ ...edit, gender: e.target.value as Product['gender'] })}><option value="men">Men</option><option value="women">Women</option></select></Field>
              <Field label="Collection" htmlFor="e-l"><select id="e-l" className="field" value={edit.line} onChange={(e) => setEdit({ ...edit, line: e.target.value as Product['line'] })}><option value="formal">Formal</option><option value="ethnic">Ethnic</option></select></Field>
              <Field label="Category" htmlFor="e-c"><input id="e-c" className="field" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="Tier" htmlFor="e-t"><select id="e-t" className="field" value={edit.tier} onChange={(e) => setEdit({ ...edit, tier: e.target.value as Product['tier'] })}><option value="standard">Standard (pass credits)</option><option value="premium">Premium</option></select></Field>
              <Field label="Rental price (48h, ₹)" htmlFor="e-p"><input id="e-p" type="number" className="field" value={edit.rentalPrice} onChange={(e) => setEdit({ ...edit, rentalPrice: +e.target.value })} /></Field>
              <Field label="Estimated retail (₹)" htmlFor="e-r"><input id="e-r" type="number" className="field" value={edit.retailPrice} onChange={(e) => setEdit({ ...edit, retailPrice: +e.target.value })} /></Field>
              <Field label="Refundable deposit (₹)" htmlFor="e-d"><input id="e-d" type="number" className="field" value={edit.deposit} onChange={(e) => setEdit({ ...edit, deposit: +e.target.value })} /></Field>
              <Field label="Condition" htmlFor="e-cd"><select id="e-cd" className="field" value={edit.condition} onChange={(e) => setEdit({ ...edit, condition: e.target.value as Condition })}>{['Like new', 'Excellent', 'Very good', 'Good'].map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Sizes (comma separated)" htmlFor="e-s"><input id="e-s" className="field" value={edit.sizes.join(', ')} onChange={(e) => setEdit({ ...edit, sizes: e.target.value.split(',').map((s) => s.trim()) })} /></Field>
              <Field label="Colour name" htmlFor="e-cn"><input id="e-cn" className="field" value={edit.color} onChange={(e) => setEdit({ ...edit, color: e.target.value })} /></Field>
              <Field label="Colour" htmlFor="e-hex"><input id="e-hex" type="color" className="field !p-1 h-[46px]" value={edit.hex} onChange={(e) => setEdit({ ...edit, hex: e.target.value })} /></Field>
              <Field label="Illustration" htmlFor="e-art"><select id="e-art" className="field" value={edit.art} onChange={(e) => setEdit({ ...edit, art: e.target.value as ArtKind })}>{ARTS.map((a) => <option key={a}>{a}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Photo URL (optional)" hint="Manage product photographs. Use an https image URL." htmlFor="e-img"><div className="flex gap-2"><ImageIcon size={18} className="mt-3.5 text-muted" /><input id="e-img" className="field" value={edit.imageUrl ?? ''} onChange={(e) => setEdit({ ...edit, imageUrl: e.target.value || undefined })} placeholder="https://…" /></div></Field></div>
              <div className="sm:col-span-2"><Field label="Fabric description" htmlFor="e-f"><input id="e-f" className="field" value={edit.fabric} onChange={(e) => setEdit({ ...edit, fabric: e.target.value })} /></Field></div>
              <fieldset className="sm:col-span-2"><legend className="text-[13px] font-semibold mb-1.5">Occasions</legend><div className="flex flex-wrap gap-2">{OCCASIONS.map((o) => <label key={o.id} className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" className="accent-[#164B35]" checked={edit.occasions.includes(o.id)} onChange={(e) => setEdit({ ...edit, occasions: e.target.checked ? [...edit.occasions, o.id] : edit.occasions.filter((x) => x !== o.id) as Occasion[] })} />{o.short}</label>)}</div></fieldset>
              {edit.tier === 'premium' && <label className="sm:col-span-2 flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" className="accent-[#164B35]" checked={edit.eliteEligible} onChange={(e) => setEdit({ ...edit, eliteEligible: e.target.checked })} />Campus Elite credits can cover this garment</label>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!units} onClose={() => setUnits(null)} title={units ? `Units · ${units.name}` : ''} wide>
        {units && <UnitManager p={state.products.find((x) => x.id === units.id)!} busy={busyUnits} />}
      </Modal>
    </AdminPanel>
  );
}

function UnitManager({ p, busy }: { p: Product; busy: Set<string> }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [addSize, setAddSize] = useState(p.sizes[0]);
  const us = state.units.filter((u) => u.productId === p.id);
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <div>
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="py-2">Unit</th><th>Size</th><th>Cycles</th><th>Status</th></tr></thead>
          <tbody>{us.map((u) => (
            <tr key={u.id} className="border-b border-line">
              <td className="py-2 tnum">{u.id}{busy.has(u.id) && <Badge tone="gold" className="ml-1">booked</Badge>}</td><td>{u.size}</td><td className="tnum">{u.rentalCycles}</td>
              <td><select aria-label={`Status of ${u.id}`} className="field !min-h-0 !py-1.5 !px-2 text-[12px]" value={u.status} onChange={(e) => { const r = actions.setUnitStatus(u.id, e.target.value as UnitStatus); toast(r.ok ? 'ok' : 'err', r.ok ? 'Unit updated' : r.error); }}>
                <option value="available">Available</option><option value="cleaning">Cleaning</option><option value="repair">Under repair</option><option value="retired">Retired</option>
              </select></td>
            </tr>
          ))}</tbody>
        </table>
        <div className="flex gap-2 mt-4 items-end"><Field label="Add a unit in size" htmlFor="u-add"><select id="u-add" className="field" value={addSize} onChange={(e) => setAddSize(e.target.value)}>{p.sizes.map((s) => <option key={s}>{s}</option>)}</select></Field><Button onClick={() => { actions.addUnit(p.id, addSize); toast('ok', `Unit added in ${addSize}`); }}><Plus size={15} />Add</Button></div>
      </div>
      <div>
        <p className="font-semibold text-[14px] mb-1">Block unavailable dates</p>
        <p className="text-[12px] text-muted mb-3">Tap a date to block or unblock it for this garment. Gold dots are blocked dates. Dates inside an active booking cannot be blocked.</p>
        <RentalCalendar value={null} days={0} min={todayISO()} max={addDays(todayISO(), 90)} isAvailable={() => true} markers={Object.fromEntries(p.blockedDates.map((d) => [d, 'blocked']))} onSelect={(d) => { const r = actions.toggleBlockedDate(p.id, d); toast(r.ok ? 'ok' : 'err', r.ok ? (p.blockedDates.includes(d) ? `${d} unblocked` : `${d} blocked`) : r.error); }} />
      </div>
    </div>
  );
}
