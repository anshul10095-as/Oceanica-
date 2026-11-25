// Business rules. Pure functions over AppState so the student app and admin portal share one truth.
import type { AppState, BagLine, Booking, BookingStatus, Plan, Product, Subscription } from '../data/types';
import { addDays, diffDays, overlaps, todayISO } from '../lib/util';

export const ACTIVE_STATUSES: BookingStatus[] = ['reserved', 'ready', 'collected'];
export const COMPLETED_STATUSES: BookingStatus[] = ['returned', 'qc', 'refunded'];

export const returnDate = (start: string, days: number) => addDays(start, days);

export function lineFee(p: Product, days: 2 | 3, state: AppState) {
  return p.rentalPrice + (days === 3 ? state.policies.surcharge72 : 0);
}

/** Dates a unit is held for an item: pickup day through return day plus the cleaning buffer. */
export function holdRange(start: string, days: number, buffer: number): [string, string] {
  return [start, addDays(start, days + buffer)];
}

export type AvailabilityReason = 'ok' | 'past' | 'too-far' | 'blocked' | 'no-size' | 'maintenance' | 'booked' | 'archived';

export const REASON_TEXT: Record<AvailabilityReason, string> = {
  ok: 'Available',
  past: 'Pickup must be at least one day from today.',
  'too-far': 'Bookings open up to 60 days ahead.',
  blocked: 'This garment is unavailable on one or more of those dates.',
  'no-size': 'This size is not stocked.',
  maintenance: 'Every unit in this size is being cleaned or repaired.',
  booked: 'Every unit in this size is booked for those dates.',
  archived: 'This garment is no longer available.',
};

interface Hold { unitId: string; start: string; days: number; ignoreBookingId?: string }

function holdsFor(state: AppState, extra: Hold[] = [], ignoreBookingId?: string): Hold[] {
  const out: Hold[] = [];
  for (const b of state.bookings) {
    if (!ACTIVE_STATUSES.includes(b.status) || b.id === ignoreBookingId) continue;
    const ext = b.extension?.status === 'approved' ? b.extension.days : 0;
    for (const it of b.items) out.push({ unitId: it.unitId, start: it.start, days: it.days + ext });
  }
  return out.concat(extra);
}

/** Find a free physical unit. `others` are lines already in the bag that hold units too. */
export function findUnit(
  state: AppState, productId: string, size: string, start: string, days: number,
  opts: { otherBag?: BagLine[]; ignoreBookingId?: string } = {},
): { unitId: string | null; reason: AvailabilityReason; free: number } {
  const p = state.products.find((x) => x.id === productId);
  if (!p || p.archived) return { unitId: null, reason: 'archived', free: 0 };
  const t = todayISO();
  if (diffDays(start, t) < state.policies.leadDays) return { unitId: null, reason: 'past', free: 0 };
  if (diffDays(start, t) > state.policies.maxAdvanceDays) return { unitId: null, reason: 'too-far', free: 0 };
  const [hs, he] = [start, addDays(start, days)];
  if (p.blockedDates.some((d) => d >= hs && d <= he)) return { unitId: null, reason: 'blocked', free: 0 };
  const sizeUnits = state.units.filter((u) => u.productId === productId && u.size === size && u.status !== 'retired');
  if (!sizeUnits.length) return { unitId: null, reason: 'no-size', free: 0 };
  const usable = sizeUnits.filter((u) => u.status === 'available');
  if (!usable.length) return { unitId: null, reason: 'maintenance', free: 0 };

  const buffer = state.policies.bufferDays;
  const holds = holdsFor(state, [], opts.ignoreBookingId);
  const [rs, re] = holdRange(start, days, buffer);
  const free = usable.filter((u) => !holds.some((h) => h.unitId === u.id && overlaps(rs, re, ...holdRange(h.start, h.days, buffer))));
  // Bag lines for the same product/size and overlapping dates each consume one of the free units.
  const bagClash = (opts.otherBag ?? []).filter((l) => l.productId === productId && l.size === size && overlaps(rs, re, ...holdRange(l.start, l.days, buffer))).length;
  const remaining = free.length - bagClash;
  if (remaining <= 0) return { unitId: null, reason: 'booked', free: 0 };
  return { unitId: free[bagClash].id, reason: 'ok', free: remaining };
}

/** Availability for a calendar: which pickup dates have at least one unit of `size` for `days`. */
export function dayAvailable(state: AppState, productId: string, size: string, start: string, days: number, otherBag?: BagLine[]) {
  return findUnit(state, productId, size, start, days, { otherBag }).reason === 'ok';
}

/** Units free today (status available and not held today). */
export function freeTodayCount(state: AppState, productId: string): number {
  const t = todayISO();
  const holds = holdsFor(state);
  return state.units.filter((u) => u.productId === productId && u.status === 'available' && !holds.some((h) => h.unitId === u.id && overlaps(t, t, ...holdRange(h.start, h.days, state.policies.bufferDays)))).length;
}

export function availabilityLabel(state: AppState, p: Product): { label: string; tone: 'ok' | 'low' | 'out' } {
  const n = freeTodayCount(state, p.id);
  if (n === 0) return { label: 'Reserve for later dates', tone: 'out' };
  if (n <= 2) return { label: `Only ${n} on the rack`, tone: 'low' };
  return { label: 'Available', tone: 'ok' };
}

// ---------- Membership ----------
export function activeSubscription(state: AppState, studentId = state.student.id): Subscription | undefined {
  const t = todayISO();
  return state.subscriptions.find((s) => s.studentId === studentId && s.status !== 'expired' && s.expiresAt >= t && s.startedAt <= t);
}

export const planOf = (state: AppState, id: Plan['id']) => state.policies.plans.find((p) => p.id === id)!;

export function creditEligible(state: AppState, p: Product, sub?: Subscription): boolean {
  if (!sub) return false;
  const plan = planOf(state, sub.planId);
  return p.tier === 'standard' || (plan.premiumAccess && p.eliteEligible);
}

export const creditsLeft = (s?: Subscription) => (s ? s.creditsTotal - s.creditsUsed : 0);

// ---------- Bag pricing ----------
export interface PricedLine { line: BagLine; product: Product; fee: number; discount: number; credit: boolean; payable: number; deposit: number; reason: AvailabilityReason }

export function priceBag(state: AppState): { lines: PricedLine[]; rental: number; discount: number; creditValue: number; credits: number; deposit: number; total: number; errors: string[] } {
  const sub = activeSubscription(state);
  const plan = sub ? planOf(state, sub.planId) : undefined;
  let creditsAvail = creditsLeft(sub);
  const lines: PricedLine[] = [];
  const errors: string[] = [];
  state.bag.forEach((line, i) => {
    const product = state.products.find((p) => p.id === line.productId);
    if (!product) return;
    const others = state.bag.slice(0, i);
    const reason = findUnit(state, line.productId, line.size, line.start, line.days, { otherBag: others }).reason;
    if (reason !== 'ok') errors.push(`${product.name} (${line.size}): ${REASON_TEXT[reason]}`);
    const fee = lineFee(product, line.days, state);
    let credit = false, discount = 0, payable = fee;
    if (line.useCredit && creditEligible(state, product, sub) && creditsAvail > 0) {
      credit = true; creditsAvail -= 1;
      payable = fee - product.rentalPrice; // credit covers the 48-hour rental; 72-hour surcharge stays payable
    } else if (plan && plan.discount > 0) {
      discount = Math.round((fee * plan.discount) / 100);
      payable = fee - discount;
    }
    lines.push({ line, product, fee, discount, credit, payable, deposit: product.deposit, reason });
  });
  const rental = lines.reduce((a, l) => a + l.fee, 0);
  const discount = lines.reduce((a, l) => a + l.discount, 0);
  const creditValue = lines.filter((l) => l.credit).reduce((a, l) => a + l.product.rentalPrice, 0);
  const credits = lines.filter((l) => l.credit).length;
  const deposit = lines.reduce((a, l) => a + l.deposit, 0);
  const payable = lines.reduce((a, l) => a + l.payable, 0);
  return { lines, rental, discount, creditValue, credits, deposit, total: payable + deposit, errors };
}

// ---------- Metrics ----------
export function bookingEnd(b: Booking) {
  const ext = b.extension?.status === 'approved' ? b.extension.days : 0;
  return b.items.map((i) => addDays(i.start, i.days + ext)).sort().pop()!;
}

export function metrics(state: AppState, includeDemo = true) {
  const keep = <T extends { demo?: boolean }>(x: T) => includeDemo || !x.demo;
  const bookings = state.bookings.filter(keep);
  const pays = state.payments.filter(keep);
  const sum = (kinds: string[], statuses = ['paid']) => pays.filter((p) => kinds.includes(p.kind) && statuses.includes(p.status)).reduce((a, p) => a + p.amount, 0);
  const rentalRevenue = sum(['rental', 'extension']);
  const damageRecovered = sum(['damage']);
  const subscriptionRevenue = sum(['subscription']);
  const depositsHeld = bookings.filter((b) => ['reserved', 'ready', 'collected', 'returned', 'qc'].includes(b.status)).reduce((a, b) => a + b.depositHeld, 0);
  const completed = bookings.filter((b) => COMPLETED_STATUSES.includes(b.status));
  const completedItems = completed.flatMap((b) => b.items);
  const activeItems = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).flatMap((b) => b.items);
  const savings = [...completedItems, ...activeItems].reduce((a, it) => {
    const p = state.products.find((x) => x.id === it.productId);
    return a + (p ? Math.max(0, p.retailPrice - (it.creditUsed ? 0 : it.rentalFee - it.discount)) : 0);
  }, 0);
  const cleaning = state.cleaning.filter(keep);
  const repairs = state.repairs.filter(keep);
  const units = state.units.filter((u) => u.status !== 'retired');
  const cycles = units.reduce((a, u) => a + u.rentalCycles, 0);
  const t = todayISO();
  const heldToday = new Set(bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).flatMap((b) => b.items.filter((i) => overlaps(t, t, i.start, addDays(i.start, i.days))).map((i) => i.unitId)));
  const subs = state.subscriptions.filter(keep);
  const activeMembers = subs.filter((s) => s.status !== 'expired' && s.expiresAt >= t).length;
  const late = completed.filter((b) => b.returnedAt && b.returnedAt > addDays(b.items[0].start, b.items[0].days + (b.extension?.status === 'approved' ? b.extension.days : 0))).length;
  return {
    rentalRevenue, subscriptionRevenue, damageRecovered, depositsHeld,
    totalBookings: bookings.filter((b) => b.status !== 'cancelled').length,
    activeRentals: bookings.filter((b) => b.status === 'collected').length,
    upcomingPickups: bookings.filter((b) => b.status === 'reserved' || b.status === 'ready').length,
    pendingReturns: bookings.filter((b) => b.status === 'collected' || b.status === 'returned' || b.status === 'qc').length,
    activeMembers,
    availableUnits: units.filter((u) => u.status === 'available' && !heldToday.has(u.id)).length,
    totalUnits: units.length,
    utilisation: units.length ? Math.round((heldToday.size / units.length) * 100) : 0,
    cleaningCost: cleaning.reduce((a, c) => a + c.cost, 0),
    repairCost: repairs.filter((r) => r.status === 'done').reduce((a, r) => a + r.cost, 0),
    completedRentals: completedItems.length,
    garmentsReused: units.filter((u) => u.rentalCycles >= 2).length,
    garmentsCirculated: units.filter((u) => u.rentalCycles >= 1).length,
    estimatedSavings: savings,
    garmentsCleaned: cleaning.filter((c) => c.status === 'done').length,
    garmentsRepaired: repairs.filter((r) => r.status === 'done').length,
    avgCycles: units.length ? cycles / units.length : 0,
    totalCycles: cycles,
    returnCompliance: completed.length ? Math.round(((completed.length - late) / completed.length) * 100) : 100,
    upcomingPopups: state.events.filter((e) => e.date >= t).length,
  };
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  reserved: 'Reserved', ready: 'Ready for pickup', collected: 'Collected', returned: 'Returned', qc: 'Quality checked', refunded: 'Deposit refunded', cancelled: 'Cancelled',
};

export const TIMELINE = ['Reserved', 'Ready for Pickup', 'Collected', 'Return Due', 'Returned', 'Quality Checked', 'Deposit Refunded'];
export function timelineIndex(s: BookingStatus): number {
  return { reserved: 0, ready: 1, collected: 3, returned: 4, qc: 5, refunded: 6, cancelled: -1 }[s];
}
