import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, MessageSquare, Copy } from 'lucide-react';
import { useStore } from '../../store/store';
import { COMPLETED_STATUSES, metrics } from '../../store/rules';
import { OCCASIONS } from '../../data/catalogue';
import { Button, Empty, Modal, Stat, useToast } from '../../components/ui';
import { addDays, csvEscape, cx, inr, monthLabel, todayISO } from '../../lib/util';
import { AdminPanel } from './AdminShell';

const C = { rental: '#164B35', sub: '#D4B477', third: '#C97654', sage: '#8FAE8A', ink: '#5b6660' };
const tick = { fill: 'rgb(var(--muted))', fontSize: 11 };
const tip = { contentStyle: { background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12, color: 'rgb(var(--fg))' }, labelStyle: { color: 'rgb(var(--fg))', fontWeight: 700 } };
const money = (v: number) => (v >= 1000 ? `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `₹${v}`);

function Card({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return <section className={cx('rounded-2xl border border-line bg-surface p-4 lg:p-5 min-w-0', className)}><h2 className="font-bold">{title}</h2>{sub && <p className="text-[12px] text-muted">{sub}</p>}<div className="h-[240px] mt-3">{children}</div></section>;
}

export function Analytics() {
  const { state } = useStore();
  const [demo, setDemo] = useState(true);
  const keep = <T extends { demo?: boolean }>(x: T) => demo || !x.demo;
  const m = metrics(state, demo);
  const data = useMemo(() => {
    const t = todayISO();
    const months = Array.from({ length: 5 }, (_, i) => { const d = new Date(t + 'T00:00:00'); d.setDate(1); d.setMonth(d.getMonth() - (4 - i)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
    const pays = state.payments.filter(keep);
    const byMonth = months.map((mo) => {
      const inM = pays.filter((p) => p.at.slice(0, 7) === mo);
      const rental = inM.filter((p) => (p.kind === 'rental' || p.kind === 'extension') && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
      const sub = inM.filter((p) => p.kind === 'subscription' && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
      const cleaning = state.cleaning.filter(keep).filter((c) => c.date.slice(0, 7) === mo).reduce((a, c) => a + c.cost, 0);
      const repair = state.repairs.filter(keep).filter((r) => r.date.slice(0, 7) === mo && r.status === 'done').reduce((a, r) => a + r.cost, 0);
      const depositsIn = pays.filter((p) => p.kind === 'deposit' && p.at.slice(0, 7) === mo).reduce((a, p) => a + p.amount, 0);
      const depositsOut = pays.filter((p) => p.kind === 'deposit-refund' && p.at.slice(0, 7) === mo).reduce((a, p) => a + p.amount, 0);
      const end = `${mo}-31`;
      const members = state.subscriptions.filter(keep).filter((s) => s.startedAt <= end && s.expiresAt >= `${mo}-01`).length;
      return { month: monthLabel(`${mo}-01`), rental, sub, total: rental + sub, cleaning, repair, depositsIn, depositsOut, members };
    });
    const items = state.bookings.filter(keep).filter((b) => b.status !== 'cancelled').flatMap((b) => b.items);
    const cat: Record<string, number> = {};
    const occ: Record<string, number> = {};
    for (const it of items) { const p = state.products.find((x) => x.id === it.productId); if (!p) continue; cat[p.category] = (cat[p.category] ?? 0) + 1; p.occasions.forEach((o) => { occ[o] = (occ[o] ?? 0) + 1; }); }
    const categories = Object.entries(cat).map(([name, v]) => ({ name, v })).sort((a, b) => b.v - a.v);
    const occasions = OCCASIONS.map((o) => ({ name: o.short, v: occ[o.id] ?? 0 }));
    const util = [...new Set(state.products.map((p) => p.category))].map((c) => {
      const us = state.units.filter((u) => u.status !== 'retired' && state.products.find((p) => p.id === u.productId)?.category === c);
      const cycles = items.filter((i) => state.products.find((p) => p.id === i.productId)?.category === c).length;
      return { name: c, v: us.length ? +(cycles / us.length).toFixed(2) : 0 };
    }).sort((a, b) => b.v - a.v);
    const done = state.bookings.filter(keep).filter((b) => COMPLETED_STATUSES.includes(b.status));
    const late = done.filter((b) => b.returnedAt && b.returnedAt > addDays(b.items[0].start, b.items[0].days + (b.extension?.status === 'approved' ? b.extension.days : 0))).length;
    return { byMonth, categories, occasions, util, compliance: [{ name: 'On time', v: done.length - late }, { name: 'Late', v: late }] };
  }, [state, demo]);

  return (
    <AdminPanel title="Analytics" sub="Rental revenue is recognised separately from refundable deposits. Toggle seeded demo data off to see only transactions made in this session." actions={
      <div className="flex rounded-full bg-tint p-1 text-[13px] font-semibold" role="radiogroup" aria-label="Data source">
        <button role="radio" aria-checked={demo} onClick={() => setDemo(true)} className={cx('h-9 px-4 rounded-full', demo && 'bg-surface shadow-sm')}>Demo + session</button>
        <button role="radio" aria-checked={!demo} onClick={() => setDemo(false)} className={cx('h-9 px-4 rounded-full', !demo && 'bg-surface shadow-sm')}>Session only</button>
      </div>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Rental revenue" value={inr(m.rentalRevenue)} />
        <Stat label="Subscription revenue" value={inr(m.subscriptionRevenue)} />
        <Stat label="Deposits held (not revenue)" value={inr(m.depositsHeld)} />
        <Stat label="Damage recovered from deposits" value={inr(m.damageRecovered)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Rental vs subscription revenue" sub="Monthly, recognised revenue only">
          <ResponsiveContainer><ComposedChart data={data.byMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} tickFormatter={money} axisLine={false} tickLine={false} /><Tooltip {...tip} formatter={(v: number) => inr(v)} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="rental" name="Rental" fill={C.rental} radius={[4, 4, 0, 0]} /><Bar dataKey="sub" name="Subscription" fill={C.sub} radius={[4, 4, 0, 0]} /><Line dataKey="total" name="Total monthly revenue" stroke={C.third} strokeWidth={2} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer>
        </Card>
        <Card title="Deposits collected vs refunded" sub="Held as a liability; shown apart from revenue">
          <ResponsiveContainer><BarChart data={data.byMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} tickFormatter={money} axisLine={false} tickLine={false} /><Tooltip {...tip} formatter={(v: number) => inr(v)} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="depositsIn" name="Collected" fill={C.sage} radius={[4, 4, 0, 0]} /><Bar dataKey="depositsOut" name="Refunded" fill={C.ink} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Demand by clothing category" sub="Garments booked">
          <ResponsiveContainer><BarChart data={data.categories} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}><CartesianGrid horizontal={false} stroke="rgb(var(--line))" /><XAxis type="number" tick={tick} axisLine={false} tickLine={false} allowDecimals={false} /><YAxis type="category" dataKey="name" tick={tick} width={78} axisLine={false} tickLine={false} /><Tooltip {...tip} /><Bar dataKey="v" name="Bookings" fill={C.rental} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Demand by occasion" sub="Bookings of garments suited to each occasion (a garment can suit several)">
          <ResponsiveContainer><BarChart data={data.occasions} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} interval={0} /><YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="v" name="Bookings" fill={C.third} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Membership growth" sub="Members active at any point in the month">
          <ResponsiveContainer><LineChart data={data.byMonth} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip {...tip} /><Line dataKey="members" name="Members" stroke={C.rental} strokeWidth={2.5} dot={{ r: 4, fill: C.sub, stroke: C.rental }} /></LineChart></ResponsiveContainer>
        </Card>
        <Card title="Inventory utilisation" sub={`Rentals per unit by category · ${m.utilisation}% of units held today`}>
          <ResponsiveContainer><BarChart data={data.util} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="name" tick={{ ...tick, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} /><YAxis tick={tick} axisLine={false} tickLine={false} /><Tooltip {...tip} /><Bar dataKey="v" name="Rentals per unit" fill={C.sage} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Cleaning and repair expenditure" sub="Monthly operating cost">
          <ResponsiveContainer><BarChart data={data.byMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgb(var(--line))" /><XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} tickFormatter={money} axisLine={false} tickLine={false} /><Tooltip {...tip} formatter={(v: number) => inr(v)} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="cleaning" name="Cleaning" stackId="a" fill={C.rental} /><Bar dataKey="repair" name="Repair" stackId="a" fill={C.third} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Return compliance" sub={`${m.returnCompliance}% of completed rentals returned on time`}>
          <ResponsiveContainer><PieChart><Pie data={data.compliance} dataKey="v" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">{data.compliance.map((_, i) => <Cell key={i} fill={i === 0 ? C.rental : C.third} />)}</Pie><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
        </Card>
      </div>
    </AdminPanel>
  );
}

// ---------------- Feedback ----------------
const FIELDS: [string, string][] = [['frequency', 'Occasion purchase frequency'], ['cleanedOk', 'Willing to rent cleaned clothes'], ['price', 'Acceptable 48h rental price'], ['subscription', 'Interest in subscriptions'], ['pickup', 'Preferred pickup'], ['hygiene', 'Hygiene concern']];

export function FeedbackAdmin() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [csv, setCsv] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const fb = state.feedback;
  const dist = (k: string) => { const c: Record<string, number> = {}; fb.forEach((f) => { const v = (f as unknown as Record<string, string | string[]>)[k]; (Array.isArray(v) ? v : [v]).forEach((x) => { c[x] = (c[x] ?? 0) + 1; }); }); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
  const avg = fb.length ? fb.reduce((a, f) => a + f.likelihood, 0) / fb.length : 0;
  const exportCsv = () => {
    const cols = ['id', 'at', 'frequency', 'categories', 'cleanedOk', 'price', 'subscription', 'pickup', 'hygiene', 'likelihood', 'comments'];
    const text = [cols.join(','), ...fb.map((f) => cols.map((c) => csvEscape((f as unknown as Record<string, unknown>)[c])).join(','))].join('\n');
    if (!__SINGLE__) {
      try { const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = `rewear-feedback-${todayISO()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('ok', 'CSV downloaded'); return; } catch { /* fall through to copy view */ }
    }
    setCsv(text);
  };
  return (
    <AdminPanel title="Customer feedback" sub="Responses submitted through the pilot validation form. Nothing here is pre-filled: the page shows only real submissions made in this browser." actions={<div className="flex gap-2"><Button variant="secondary" disabled={!fb.length} onClick={exportCsv}><Download size={16} />Export CSV</Button>{fb.length > 0 && <Button variant="danger" onClick={() => setConfirmClear(true)}>Clear</Button>}</div>}>
      {!fb.length ? <Empty icon={<MessageSquare size={24} />} title="No responses yet" body="Share the feedback form at a pop-up or in class. Responses appear here with their distributions." action={<a href="#feedback" className="font-semibold text-brand underline">Open the feedback form</a>} /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat label="Responses" value={fb.length} />
            <Stat label="Average likelihood to use" value={`${avg.toFixed(1)} / 5`} />
            <Stat label="Would rent cleaned clothes" value={`${Math.round((fb.filter((f) => f.cleanedOk === 'Yes').length / fb.length) * 100)}%`} sub="answered Yes" />
            <Stat label="Interested in a pass" value={`${Math.round((fb.filter((f) => f.subscription !== 'Not interested').length / fb.length) * 100)}%`} sub="very or somewhat" />
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...FIELDS, ['categories', 'Preferred rental categories'] as [string, string], ['likelihood', 'Likelihood (1–5)'] as [string, string]].map(([k, l]) => {
              const d = k === 'likelihood' ? [5, 4, 3, 2, 1].map((n) => [String(n), fb.filter((f) => f.likelihood === n).length] as [string, number]) : dist(k);
              const max = Math.max(1, ...d.map((x) => x[1]));
              return (
                <section key={k} className="rounded-2xl border border-line bg-surface p-4">
                  <h2 className="font-bold text-[14px] mb-3">{l}</h2>
                  <ul className="space-y-2">{d.map(([name, v]) => <li key={name} className="text-[12px]"><div className="flex justify-between"><span>{name}</span><span className="tnum font-semibold">{v} · {Math.round((v / fb.length) * 100)}%</span></div><div className="h-2 rounded-full bg-tint mt-1 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div></li>)}</ul>
                </section>
              );
            })}
          </div>
          <h2 className="font-bold mt-8 mb-3">Open-ended feedback</h2>
          <ul className="space-y-2">{fb.filter((f) => f.comments.trim()).map((f) => <li key={f.id} className="rounded-xl border border-line bg-surface p-3 text-[14px]">“{f.comments}”<span className="block text-[11px] text-muted mt-1 tnum">{f.id} · {f.at.slice(0, 10)}</span></li>)}{!fb.some((f) => f.comments.trim()) && <li className="text-muted text-[14px]">No written comments yet.</li>}</ul>
        </>
      )}
      <Modal open={!!csv} onClose={() => setCsv('')} title="Feedback CSV" wide footer={<Button onClick={() => { navigator.clipboard?.writeText(csv).then(() => toast('ok', 'CSV copied to clipboard'), () => toast('err', 'Copy failed. Select the text and copy it manually.')); }}><Copy size={16} />Copy CSV</Button>}>
        <p className="text-[13px] text-muted mb-3">The sandboxed preview cannot download files. Copy this CSV into a spreadsheet; the deployed app downloads it directly.</p>
        <textarea readOnly className="field font-mono text-[12px]" rows={12} value={csv} onFocus={(e) => e.currentTarget.select()} />
      </Modal>
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear all responses?"><p className="text-[14px] text-muted">Export first if you need them. This cannot be undone.</p><div className="flex gap-2 mt-4"><Button variant="secondary" className="flex-1" onClick={() => setConfirmClear(false)}>Keep</Button><Button className="flex-1 !bg-terra !text-white" onClick={() => { actions.clearFeedback(); setConfirmClear(false); toast('ok', 'Responses cleared'); }}>Clear</Button></div></Modal>
    </AdminPanel>
  );
}
