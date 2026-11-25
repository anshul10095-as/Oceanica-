import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppState, BagLine, Booking, BookingItem, Feedback, Plan, PopupEvent, Policies, Product, Student, UnitStatus, Condition } from '../data/types';
import { createSeed, STATE_VERSION } from '../data/seed';
import { addDays, diffDays, nowISO, todayISO, uid } from '../lib/util';
import { activeSubscription, ACTIVE_STATUSES, creditEligible, creditsLeft, findUnit, planOf, priceBag, REASON_TEXT } from './rules';

const KEY = 'rewear-campus/state';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === STATE_VERSION) return s;
    }
  } catch { /* storage unavailable: run in memory */ }
  return createSeed();
}

export type Result<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
const ok = <T,>(value: T): Result<T> => ({ ok: true, value });
const fail = (error: string): Result<never> => ({ ok: false, error });

export interface CheckoutInput { name: string; college: string; phone: string; email: string; location: string; slot: string; method: 'upi' | 'card' | 'pickup' }

function makeActions(get: () => AppState, set: (s: AppState) => void) {
  // Every mutation works on a deep copy and commits atomically, so a failed rule leaves state untouched.
  function tx<T>(fn: (d: AppState) => Result<T>): Result<T> {
    const draft = structuredClone(get());
    const r = fn(draft);
    if (r.ok) set(draft);
    return r;
  }
  const log = (b: Booking, status: Booking['history'][number]['status'], note?: string) => b.history.push({ at: nowISO(), status, note });
  const refreshUnit = (d: AppState, unitId: string) => {
    const u = d.units.find((x) => x.id === unitId); if (!u || u.status === 'retired') return;
    const repairing = d.repairs.some((r) => r.unitId === unitId && r.status === 'in-progress');
    const cleaning = d.cleaning.some((c) => c.unitId === unitId && c.status === 'in-progress');
    u.status = repairing ? 'repair' : cleaning ? 'cleaning' : 'available';
  };
  const unitBusy = (d: AppState, unitId: string) => d.bookings.some((b) => ACTIVE_STATUSES.includes(b.status) && b.items.some((i) => i.unitId === unitId));

  return {
    setRole: (role: AppState['role']) => tx((d) => { d.role = role; return ok(role); }),
    reset: () => { const s = createSeed(); set(s); return ok(s); },
    updateStudent: (patch: Partial<Student>) => tx((d) => { Object.assign(d.student, patch); return ok(d.student); }),
    toggleWishlist: (id: string) => tx((d) => {
      const has = d.wishlist.includes(id);
      d.wishlist = has ? d.wishlist.filter((x) => x !== id) : [...d.wishlist, id];
      return ok(!has);
    }),

    // ---------- Bag ----------
    addToBag: (line: Omit<BagLine, 'lineId'>) => tx((d) => {
      const r = findUnit(d, line.productId, line.size, line.start, line.days, { otherBag: d.bag });
      if (r.reason !== 'ok') return fail(REASON_TEXT[r.reason]);
      const dup = d.bag.find((l) => l.productId === line.productId && l.size === line.size && l.start === line.start);
      if (dup) return fail('This garment, size and date are already in your bag.');
      const p = d.products.find((x) => x.id === line.productId)!;
      const sub = activeSubscription(d);
      const usedInBag = d.bag.filter((l) => l.useCredit).length;
      const useCredit = line.useCredit && creditEligible(d, p, sub) && creditsLeft(sub) - usedInBag > 0;
      d.bag.push({ ...line, useCredit, lineId: uid('L', 5) });
      return ok(useCredit);
    }),
    updateBagLine: (lineId: string, patch: Partial<BagLine>) => tx((d) => {
      const i = d.bag.findIndex((l) => l.lineId === lineId); if (i < 0) return fail('Item not found.');
      const next = { ...d.bag[i], ...patch };
      const others = d.bag.filter((l) => l.lineId !== lineId);
      const r = findUnit(d, next.productId, next.size, next.start, next.days, { otherBag: others });
      if (r.reason !== 'ok' && (patch.size || patch.start || patch.days)) return fail(REASON_TEXT[r.reason]);
      if (patch.useCredit) {
        const sub = activeSubscription(d);
        const p = d.products.find((x) => x.id === next.productId)!;
        if (!sub) return fail('Credits need an active ReWear Pass.');
        if (!creditEligible(d, p, sub)) return fail(`${planOf(d, sub.planId).name} credits do not cover this garment.`);
        if (creditsLeft(sub) - others.filter((l) => l.useCredit).length <= 0) return fail('No rental credits left this cycle.');
      }
      d.bag[i] = next;
      return ok(next);
    }),
    removeBagLine: (lineId: string) => tx((d) => { d.bag = d.bag.filter((l) => l.lineId !== lineId); return ok(true); }),

    checkout: (input: CheckoutInput) => tx<Booking>((d) => {
      if (!d.bag.length) return fail('Your rental bag is empty.');
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return fail('You are offline. Reservations need a live availability check.');
      const priced = priceBag(d);
      if (priced.errors.length) return fail(priced.errors[0]);
      const sub = activeSubscription(d);
      const ss = sub ? d.subscriptions.find((s) => s.id === sub.id)! : undefined;
      if (priced.credits > creditsLeft(ss)) return fail('Not enough rental credits for this booking.');
      const id = uid('RWC', 6);
      const items: BookingItem[] = [];
      const taken: BagLine[] = [];
      for (const pl of priced.lines) {
        const r = findUnit(d, pl.line.productId, pl.line.size, pl.line.start, pl.line.days, { otherBag: taken });
        if (!r.unitId) return fail(`${pl.product.name}: ${REASON_TEXT[r.reason]}`);
        taken.push(pl.line);
        items.push({ lineId: `${id}-${items.length + 1}`, productId: pl.product.id, unitId: r.unitId, size: pl.line.size, start: pl.line.start, days: pl.line.days, rentalFee: pl.fee, discount: pl.discount, creditUsed: pl.credit, deposit: pl.deposit });
      }
      // Each credit redemption is tied to one booking line; a line can never redeem twice.
      if (ss) for (const it of items.filter((x) => x.creditUsed)) {
        if (ss.redemptions.some((r) => r.lineId === it.lineId)) return fail('This credit has already been redeemed.');
        ss.redemptions.push({ bookingId: id, lineId: it.lineId, at: nowISO() });
        ss.creditsUsed += 1;
      }
      const rentalPaid = priced.total - priced.deposit;
      const b: Booking = {
        id, studentId: d.student.id, items, status: 'reserved', pickupLocation: input.location, pickupSlot: input.slot, paymentMethod: input.method,
        rentalPaid, depositHeld: priced.deposit, creditsRedeemed: priced.credits, createdAt: nowISO(),
        contact: { name: input.name, college: input.college, phone: input.phone, email: input.email }, history: [],
      };
      log(b, 'reserved', input.method === 'pickup' ? 'Payment due at pickup' : 'Simulated payment captured');
      d.bookings.unshift(b);
      const status = input.method === 'pickup' ? 'due' : 'paid';
      if (rentalPaid > 0) d.payments.push({ id: `${id}-r`, ref: id, kind: 'rental', amount: rentalPaid, method: input.method, status, at: todayISO() });
      d.payments.push({ id: `${id}-d`, ref: id, kind: 'deposit', amount: priced.deposit, method: input.method, status, at: todayISO() });
      Object.assign(d.student, { name: input.name, college: input.college, phone: input.phone, email: input.email });
      d.bag = [];
      return ok(b);
    }),

    requestCancellation: (bookingId: string) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b) return fail('Booking not found.');
      if (b.status !== 'reserved' && b.status !== 'ready') return fail('Only bookings that have not been collected can be cancelled.');
      const hours = diffDays(b.items[0].start, todayISO()) * 24;
      if (hours >= d.policies.freeCancelHours) return ok(cancelBooking(d, b, 'Cancelled by student'));
      b.cancellationRequested = true; log(b, 'note', 'Late cancellation requested; awaiting review');
      return ok('requested');
    }),
    requestExtension: (bookingId: string, days: number) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status !== 'collected' && b.status !== 'ready' && b.status !== 'reserved') return fail('Extensions apply to upcoming or active rentals.');
      if (b.extension?.status === 'requested') return fail('An extension request is already pending.');
      const buffer = d.policies.bufferDays;
      for (const it of b.items) {
        const end = addDays(it.start, it.days);
        const clash = d.bookings.some((o) => o.id !== b.id && ACTIVE_STATUSES.includes(o.status) && o.items.some((oi) => oi.unitId === it.unitId && oi.start <= addDays(end, days + buffer) && oi.start > it.start));
        if (clash) return fail('Another student has booked this garment straight after you, so it cannot be extended.');
      }
      b.extension = { days, fee: days * d.policies.extensionPerDay * b.items.length, status: 'requested' };
      log(b, 'note', `Extension of ${days} day(s) requested`);
      return ok(b.extension);
    }),
    adminExtension: (bookingId: string, approve: boolean) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b?.extension || b.extension.status !== 'requested') return fail('No pending extension.');
      b.extension.status = approve ? 'approved' : 'rejected';
      if (approve) d.payments.push({ id: uid('PX'), ref: b.id, kind: 'extension', amount: b.extension.fee, method: 'system', status: 'paid', at: todayISO() });
      log(b, 'note', approve ? `Extension approved (+${b.extension.days} day)` : 'Extension declined');
      return ok(true);
    }),
    adminCancel: (bookingId: string) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || !['reserved', 'ready'].includes(b.status)) return fail('Only uncollected bookings can be cancelled.');
      return ok(cancelBooking(d, b, 'Cancellation approved'));
    }),

    // ---------- Rental operations (admin) ----------
    advance: (bookingId: string, to: 'ready' | 'collected') => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId); if (!b) return fail('Booking not found.');
      if (to === 'ready' && b.status !== 'reserved') return fail('Only reserved bookings can be marked ready.');
      if (to === 'collected' && b.status !== 'ready') return fail('Mark the booking ready for pickup first.');
      b.status = to; log(b, to);
      if (to === 'collected') d.payments.filter((p) => p.ref === b.id && p.status === 'due').forEach((p) => { p.status = 'paid'; });
      return ok(b);
    }),
    processReturn: (bookingId: string) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status !== 'collected') return fail('Only collected rentals can be returned.');
      b.status = 'returned'; b.returnedAt = todayISO(); log(b, 'returned');
      for (const it of b.items) {
        const u = d.units.find((x) => x.id === it.unitId); if (u) u.rentalCycles += 1;
        d.cleaning.push({ id: uid('CL'), unitId: it.unitId, date: todayISO(), cost: d.policies.cleaningCost, status: 'in-progress' });
        refreshUnit(d, it.unitId);
      }
      return ok(b);
    }),
    qualityCheck: (bookingId: string, result: { condition: Condition; damageNote: string; charge: number; repair: boolean }) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status !== 'returned') return fail('Process the return before the quality check.');
      if (result.charge < 0 || result.charge > b.depositHeld) return fail('Damage charge must be between ₹0 and the deposit held.');
      b.status = 'qc';
      if (result.damageNote || result.charge) b.damage = { note: result.damageNote || 'Damage recorded', charge: result.charge };
      for (const it of b.items) {
        const u = d.units.find((x) => x.id === it.unitId); if (u) u.condition = result.condition;
        if (result.repair) { d.repairs.push({ id: uid('RP'), unitId: it.unitId, date: todayISO(), cost: 0, note: result.damageNote || 'Repair after return', status: 'in-progress' }); refreshUnit(d, it.unitId); }
      }
      log(b, 'qc', result.damageNote ? `Condition: ${result.condition}. ${result.damageNote}` : `Condition: ${result.condition}`);
      return ok(b);
    }),
    refundDeposit: (bookingId: string) => tx((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status !== 'qc') return fail('Complete the quality check before refunding the deposit.');
      const charge = b.damage?.charge ?? 0;
      b.depositRefunded = b.depositHeld - charge; b.status = 'refunded';
      d.payments.filter((p) => p.ref === b.id && p.kind === 'deposit').forEach((p) => { p.status = 'refunded'; });
      d.payments.push({ id: uid('PR'), ref: b.id, kind: 'deposit-refund', amount: b.depositRefunded, method: 'system', status: 'paid', at: todayISO() });
      if (charge) d.payments.push({ id: uid('PD'), ref: b.id, kind: 'damage', amount: charge, method: 'system', status: 'paid', at: todayISO() });
      log(b, 'refunded', `Simulated refund of ₹${b.depositRefunded}${charge ? ` (₹${charge} retained for damage)` : ''}`);
      return ok(b);
    }),

    // ---------- Membership ----------
    subscribe: (planId: Plan['id'], method: 'upi' | 'card') => tx((d) => {
      if (activeSubscription(d)) return fail('You already have an active ReWear Pass. Upgrade it instead.');
      const plan = planOf(d, planId);
      const id = uid('SUB', 6);
      const t = todayISO();
      d.subscriptions.push({ id, studentId: d.student.id, planId, startedAt: t, expiresAt: addDays(t, 30), creditsTotal: plan.credits, creditsUsed: 0, status: 'active', paid: plan.price, redemptions: [] });
      d.payments.push({ id: `${id}-p`, ref: id, kind: 'subscription', amount: plan.price, method, status: 'paid', at: t });
      return ok(id);
    }),
    upgrade: (planId: Plan['id']) => tx((d) => {
      const s0 = activeSubscription(d); if (!s0) return fail('No active membership to upgrade.');
      const s = d.subscriptions.find((x) => x.id === s0.id)!;
      const cur = planOf(d, s.planId), next = planOf(d, planId);
      if (next.price <= cur.price) return fail('Choose a higher plan to upgrade. Downgrades apply at renewal.');
      const diff = next.price - cur.price;
      s.planId = planId; s.creditsTotal = next.credits; s.paid += diff; s.status = 'active';
      d.payments.push({ id: uid('PU'), ref: s.id, kind: 'subscription', amount: diff, method: 'upi', status: 'paid', at: todayISO() });
      return ok(diff);
    }),
    cancelSubscription: () => tx((d) => {
      const s0 = activeSubscription(d); if (!s0) return fail('No active membership.');
      const s = d.subscriptions.find((x) => x.id === s0.id)!;
      if (s.status !== 'active') return fail('Cancellation already requested.');
      s.status = 'cancel-requested';
      return ok(s);
    }),
    adminSubscription: (id: string, action: 'approve-cancel' | 'extend' | 'add-credit' | 'expire') => tx((d) => {
      const s = d.subscriptions.find((x) => x.id === id); if (!s) return fail('Membership not found.');
      if (action === 'approve-cancel') { if (s.status !== 'cancel-requested') return fail('No cancellation request.'); s.status = 'cancelled'; }
      if (action === 'extend') s.expiresAt = addDays(s.expiresAt, 7);
      if (action === 'add-credit') s.creditsTotal += 1;
      if (action === 'expire') { s.status = 'expired'; s.expiresAt = addDays(todayISO(), -1); }
      return ok(s);
    }),

    // ---------- Pop-ups ----------
    bookAppointment: (eventId: string, slot: string, kind: 'fitting' | 'pickup', productId?: string, size?: string) => tx((d) => {
      const e = d.events.find((x) => x.id === eventId); if (!e) return fail('Event not found.');
      if (e.date < todayISO()) return fail('This pop-up has already taken place.');
      const s = e.slots.find((x) => x.time === slot); if (!s) return fail('Choose a time slot.');
      const taken = d.appointments.filter((a) => a.eventId === eventId && a.slot === slot && a.status !== 'cancelled').length;
      if (taken >= s.capacity) return fail('That slot is full. Choose another time.');
      if (d.appointments.some((a) => a.eventId === eventId && a.slot === slot && a.studentId === d.student.id && a.status === 'booked')) return fail('You already have an appointment in this slot.');
      const a = { id: uid('APT', 5), eventId, studentId: d.student.id, slot, kind, productId, size, status: 'booked' as const, createdAt: nowISO() };
      d.appointments.push(a);
      return ok(a);
    }),
    cancelAppointment: (id: string) => tx((d) => {
      const a = d.appointments.find((x) => x.id === id); if (!a) return fail('Appointment not found.');
      a.status = 'cancelled'; return ok(a);
    }),
    markAppointment: (id: string, status: 'attended' | 'cancelled') => tx((d) => {
      const a = d.appointments.find((x) => x.id === id); if (!a) return fail('Appointment not found.');
      a.status = status; return ok(a);
    }),
    upsertEvent: (e: PopupEvent) => tx((d) => {
      if (!e.name.trim() || !e.date) return fail('Event name and date are required.');
      for (const s of e.slots) {
        const taken = d.appointments.filter((a) => a.eventId === e.id && a.slot === s.time && a.status !== 'cancelled').length;
        if (s.capacity < taken) return fail(`${s.time} already has ${taken} appointments; capacity cannot go below that.`);
      }
      const i = d.events.findIndex((x) => x.id === e.id);
      if (i >= 0) d.events[i] = e; else d.events.push(e);
      d.events.sort((a, b) => a.date.localeCompare(b.date));
      return ok(e);
    }),
    deleteEvent: (id: string) => tx((d) => {
      if (d.appointments.some((a) => a.eventId === id && a.status === 'booked')) return fail('This pop-up has booked appointments. Cancel them first.');
      d.events = d.events.filter((e) => e.id !== id); return ok(true);
    }),

    // ---------- Inventory ----------
    upsertProduct: (p: Product, newSizes?: string[]) => tx((d) => {
      if (!p.name.trim()) return fail('Product name is required.');
      if (p.rentalPrice <= 0 || p.deposit < 0 || p.retailPrice <= 0) return fail('Prices must be positive numbers.');
      if (!p.sizes.length) return fail('Add at least one size.');
      const i = d.products.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const removed = d.products[i].sizes.filter((s) => !p.sizes.includes(s));
        for (const s of removed) {
          if (d.units.some((u) => u.productId === p.id && u.size === s && unitBusy(d, u.id))) return fail(`Size ${s} has active bookings and cannot be removed.`);
        }
        d.units = d.units.filter((u) => !(u.productId === p.id && removed.includes(u.size)));
        d.products[i] = p;
      } else d.products.unshift(p);
      for (const s of newSizes ?? p.sizes) {
        if (!d.units.some((u) => u.productId === p.id && u.size === s)) d.units.push({ id: `${p.id}-${s.replace(/\s+/g, '').toLowerCase()}-1`, productId: p.id, size: s, status: 'available', condition: p.condition, rentalCycles: 0, lastCleaned: todayISO() });
      }
      return ok(p);
    }),
    archiveProduct: (id: string, archived: boolean) => tx((d) => {
      const p = d.products.find((x) => x.id === id); if (!p) return fail('Product not found.');
      if (archived && d.units.some((u) => u.productId === id && unitBusy(d, u.id))) return fail('This garment has active bookings. Archive it after they are returned.');
      p.archived = archived; return ok(p);
    }),
    addUnit: (productId: string, size: string) => tx((d) => {
      const n = d.units.filter((u) => u.productId === productId && u.size === size).length + 1;
      const p = d.products.find((x) => x.id === productId)!;
      d.units.push({ id: `${productId}-${size.replace(/\s+/g, '').toLowerCase()}-${n}-${uid('u', 3).slice(2)}`, productId, size, status: 'available', condition: p.condition, rentalCycles: 0, lastCleaned: todayISO() });
      return ok(true);
    }),
    setUnitStatus: (unitId: string, status: UnitStatus) => tx((d) => {
      const u = d.units.find((x) => x.id === unitId); if (!u) return fail('Unit not found.');
      if (status === 'available') {
        if (d.cleaning.some((c) => c.unitId === unitId && c.status === 'in-progress')) return fail('Finish the cleaning record before marking this unit available.');
        if (d.repairs.some((r) => r.unitId === unitId && r.status === 'in-progress')) return fail('Finish the repair before marking this unit available.');
      }
      if (status !== 'available' && unitBusy(d, unitId)) return fail('This unit is assigned to an active booking.');
      if (status === 'cleaning') d.cleaning.push({ id: uid('CL'), unitId, date: todayISO(), cost: d.policies.cleaningCost, status: 'in-progress' });
      if (status === 'repair') d.repairs.push({ id: uid('RP'), unitId, date: todayISO(), cost: 0, note: 'Marked for repair', status: 'in-progress' });
      u.status = status; return ok(u);
    }),
    completeCleaning: (id: string, cost: number) => tx((d) => {
      const c = d.cleaning.find((x) => x.id === id); if (!c) return fail('Record not found.');
      if (cost < 0) return fail('Cost cannot be negative.');
      c.status = 'done'; c.cost = cost; c.date = todayISO();
      const u = d.units.find((x) => x.id === c.unitId); if (u) u.lastCleaned = todayISO();
      refreshUnit(d, c.unitId); return ok(c);
    }),
    completeRepair: (id: string, cost: number, note: string) => tx((d) => {
      const r = d.repairs.find((x) => x.id === id); if (!r) return fail('Record not found.');
      if (cost < 0) return fail('Cost cannot be negative.');
      r.status = 'done'; r.cost = cost; if (note) r.note = note;
      refreshUnit(d, r.unitId); return ok(r);
    }),
    toggleBlockedDate: (productId: string, date: string) => tx((d) => {
      const p = d.products.find((x) => x.id === productId); if (!p) return fail('Product not found.');
      if (!p.blockedDates.includes(date)) {
        const clash = d.bookings.some((b) => ACTIVE_STATUSES.includes(b.status) && b.items.some((i) => i.productId === productId && date >= i.start && date <= addDays(i.start, i.days)));
        if (clash) return fail('That date is inside an active booking for this garment.');
        p.blockedDates.push(date); p.blockedDates.sort();
      } else p.blockedDates = p.blockedDates.filter((x) => x !== date);
      return ok(p.blockedDates);
    }),

    updatePolicies: (patch: Partial<Policies>) => tx((d) => { d.policies = { ...d.policies, ...patch }; return ok(d.policies); }),
    submitFeedback: (f: Omit<Feedback, 'id' | 'at'>) => tx((d) => { d.feedback.push({ ...f, id: uid('FB', 5), at: nowISO() }); return ok(true); }),
    clearFeedback: () => tx((d) => { d.feedback = []; return ok(true); }),
  };
}

function cancelBooking(d: AppState, b: Booking, note: string) {
  b.status = 'cancelled'; b.cancellationRequested = false;
  b.history.push({ at: nowISO(), status: 'cancelled', note: `${note}. Simulated full refund.` });
  d.payments.filter((p) => p.ref === b.id).forEach((p) => { p.status = 'refunded'; });
  const sub = d.subscriptions.find((s) => s.redemptions.some((r) => r.bookingId === b.id));
  if (sub) { const n = sub.redemptions.filter((r) => r.bookingId === b.id).length; sub.redemptions = sub.redemptions.filter((r) => r.bookingId !== b.id); sub.creditsUsed = Math.max(0, sub.creditsUsed - n); }
  return 'cancelled';
}

type Actions = ReturnType<typeof makeActions>;
interface Ctx { state: AppState; actions: Actions; online: boolean }
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const ref = useRef(state);
  ref.current = state;
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine !== false);
  const set = useCallback((s: AppState) => { ref.current = s; setState(s); }, []);
  const actions = useMemo(() => makeActions(() => ref.current, set), [set]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    // Keep several open tabs in sync (student tab and admin tab during a demo).
    const sync = (e: StorageEvent) => { if (e.key === KEY && e.newValue) { try { const s = JSON.parse(e.newValue); if (s.version === STATE_VERSION) { ref.current = s; setState(s); } } catch { /* ignore */ } } };
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.removeEventListener('storage', sync); };
  }, []);
  const value = useMemo(() => ({ state, actions, online }), [state, actions, online]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside provider');
  return c;
}
