import { useStore } from '../../store/store';
import { metrics, STATUS_LABEL } from '../../store/rules';
import { Badge, Stat } from '../../components/ui';
import { fmtShort, inr } from '../../lib/util';
import { AdminPanel } from './AdminShell';

export default function Overview() {
  const { state } = useStore();
  const m = metrics(state, true);
  const live = metrics(state, false);
  const queue = state.bookings.filter((b) => ['reserved', 'ready', 'collected', 'returned', 'qc'].includes(b.status)).slice(0, 8);
  const reqs = state.bookings.filter((b) => b.extension?.status === 'requested' || b.cancellationRequested);
  return (
    <AdminPanel title="Overview" sub="Figures update as soon as a student books, pays, returns or subscribes. Rental revenue excludes refundable deposits.">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <Stat label="Total rental revenue" value={inr(m.rentalRevenue)} sub={`${inr(live.rentalRevenue)} from this session`} />
        <Stat label="Subscription revenue" value={inr(m.subscriptionRevenue)} sub={`${inr(live.subscriptionRevenue)} from this session`} />
        <Stat label="Deposits held" value={inr(m.depositsHeld)} sub="liability, not revenue" />
        <Stat label="Total bookings" value={m.totalBookings} sub={`${live.totalBookings} from this session`} />
        <Stat label="Active rentals" value={m.activeRentals} sub="collected, not yet returned" />
        <Stat label="Upcoming pickups" value={m.upcomingPickups} />
        <Stat label="Pending returns" value={m.pendingReturns} sub="out, returned or in QC" />
        <Stat label="Active members" value={m.activeMembers} />
        <Stat label="Available inventory" value={`${m.availableUnits}/${m.totalUnits}`} sub="units free today" />
        <Stat label="Inventory utilisation" value={`${m.utilisation}%`} sub="units held by bookings today" />
        <Stat label="Cleaning costs" value={inr(m.cleaningCost)} />
        <Stat label="Repair costs" value={inr(m.repairCost)} />
        <Stat label="Upcoming pop-ups" value={m.upcomingPopups} />
      </div>
      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-5 mt-8">
        <section className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between p-4 border-b border-line"><h2 className="font-bold">Operations queue</h2><a href="#admin-rentals" className="text-[13px] font-semibold text-brand">Manage rentals</a></div>
          <div className="overflow-x-auto"><table className="w-full text-[13px] min-w-[560px]"><thead><tr className="text-left text-muted border-b border-line"><th className="p-3">Booking</th><th className="p-3">Student</th><th className="p-3">Pickup</th><th className="p-3">Status</th></tr></thead>
            <tbody>{queue.map((b) => <tr key={b.id} className="border-b border-line last:border-0"><td className="p-3 font-semibold tnum">{b.id}</td><td className="p-3">{b.contact.name}{b.demo && <Badge tone="demo" className="ml-2">demo</Badge>}</td><td className="p-3 tnum">{fmtShort(b.items[0].start)}</td><td className="p-3"><Badge tone={b.status === 'collected' ? 'gold' : 'ok'}>{STATUS_LABEL[b.status]}</Badge></td></tr>)}
            {!queue.length && <tr><td colSpan={4} className="p-6 text-center text-muted">No open bookings.</td></tr>}</tbody></table></div>
        </section>
        <section className="rounded-2xl border border-line bg-surface">
          <div className="p-4 border-b border-line"><h2 className="font-bold">Requests awaiting review</h2></div>
          <ul className="p-4 space-y-3 text-[13px]">
            {reqs.length ? reqs.map((b) => <li key={b.id} className="flex justify-between gap-3"><span><b className="tnum">{b.id}</b> · {b.contact.name}</span><Badge tone="warn">{b.cancellationRequested ? 'Late cancellation' : `Extension +${b.extension!.days}d`}</Badge></li>) : <li className="text-muted">Nothing pending.</li>}
          </ul>
        </section>
      </div>
    </AdminPanel>
  );
}
