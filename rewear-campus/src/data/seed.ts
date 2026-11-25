import type { AppState, Booking, BookingStatus, CleaningRecord, InventoryUnit, Payment, Plan, PopupEvent, Policies, RepairRecord, Subscription, Appointment } from './types';
import { buildCatalogue, unitsPerSize } from './catalogue';
import { addDays, todayISO } from '../lib/util';

export const STATE_VERSION = 3;

export const PLANS: Plan[] = [
  { id: 'basic', name: 'Campus Basic', price: 499, credits: 1, discount: 0, premiumAccess: false, priority: false,
    features: ['One eligible standard rental each month', 'Formal and ethnic collections', 'Campus pickup and return', 'Standard booking access'] },
  { id: 'plus', name: 'Campus Plus', price: 899, credits: 2, discount: 10, premiumAccess: false, priority: true,
    features: ['Two eligible standard rentals each month', 'Priority reservations', '10% off additional rentals', 'Campus pickup and return'] },
  { id: 'elite', name: 'Campus Elite', price: 1299, credits: 3, discount: 15, premiumAccess: true, priority: true,
    features: ['Three eligible rentals each month', 'Credits cover selected premium pieces', 'Priority during placement and festive weeks', '15% off additional rentals'] },
];

export const DEFAULT_POLICIES: Policies = {
  leadDays: 1,
  maxAdvanceDays: 60,
  bufferDays: 1,
  surcharge72: 100,
  extensionPerDay: 99,
  freeCancelHours: 24,
  cleaningCost: 120,
  pickupLocations: [
    'Pop-up rack A · near the main auditorium foyer (proposed)',
    'Pop-up rack B · central block courtyard (proposed)',
    'Pop-up rack C · near the student centre (proposed)',
  ],
  pickupSlots: ['9:00 – 10:00 AM', '12:30 – 1:30 PM', '4:00 – 5:00 PM', '5:30 – 6:30 PM'],
  plans: PLANS,
};

// Deterministic PRNG so the seeded demo dataset is identical on every reset.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function events(today: string): PopupEvent[] {
  const d = new Date(today + 'T00:00:00');
  const toSat = (6 - d.getDay() + 7) % 7 || 7;
  return [
    { id: 'pu-placement', name: 'Placement Week Pop-Up', theme: 'Interview blazers, suits and complete outfits', date: addDays(today, 3), start: '10:00 AM', end: '5:00 PM', location: 'Near the main auditorium foyer (proposed)', categories: ['Blazers', 'Suits', 'Shirts', 'Trousers', 'Outfit sets'], productIds: ['rw-mf-01', 'rw-mf-03', 'rw-mf-05', 'rw-mf-07', 'rw-mf-09', 'rw-wf-01', 'rw-wf-04', 'rw-wf-05', 'rw-wf-07'], slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => ({ time, capacity: 4 })), tone: 'forest' },
    { id: 'pu-weekend', name: 'Weekend Campus Closet', theme: 'A rotating mix of formal and ethnic favourites', date: addDays(today, toSat === 3 ? 10 : toSat), start: '11:00 AM', end: '4:00 PM', location: 'Central block courtyard (proposed)', categories: ['Blazers', 'Kurta sets', 'Sarees', 'Dresses'], productIds: ['rw-mf-02', 'rw-mf-04', 'rw-me-01', 'rw-me-03', 'rw-we-02', 'rw-we-05', 'rw-wf-02', 'rw-we-08'], slots: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'].map((time) => ({ time, capacity: 3 })), tone: 'ink' },
    { id: 'pu-ethnic', name: 'Ethnic Day Pop-Up', theme: 'Kurtas, sarees, Anarkalis and Nehru jackets', date: addDays(today, 9), start: '9:30 AM', end: '4:30 PM', location: 'Near the student centre (proposed)', categories: ['Kurta sets', 'Sarees', 'Anarkalis', 'Jackets'], productIds: ['rw-me-01', 'rw-me-02', 'rw-me-04', 'rw-me-05', 'rw-me-07', 'rw-we-01', 'rw-we-02', 'rw-we-03', 'rw-we-04'], slots: ['9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'].map((time) => ({ time, capacity: 4 })), tone: 'terra' },
    { id: 'pu-festive', name: 'Festive Fashion Pop-Up', theme: 'Lehengas, sherwanis and occasion sets for fest season', date: addDays(today, 16), start: '11:00 AM', end: '6:00 PM', location: 'Central block courtyard (proposed)', categories: ['Lehengas', 'Sherwanis', 'Occasion sets', 'Sarees'], productIds: ['rw-me-06', 'rw-me-08', 'rw-we-06', 'rw-we-07', 'rw-we-01', 'rw-me-02', 'rw-we-05'], slots: ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM'].map((time) => ({ time, capacity: 3 })), tone: 'gold' },
    { id: 'pu-farewell', name: 'Farewell Collection Pop-Up', theme: 'Black-tie blazers, sarees and photo-ready sets', date: addDays(today, 30), start: '10:00 AM', end: '5:00 PM', location: 'Near the main auditorium foyer (proposed)', categories: ['Blazers', 'Sarees', 'Kurta sets', 'Pantsuits'], productIds: ['rw-mf-02', 'rw-wf-01', 'rw-wf-04', 'rw-we-01', 'rw-we-02', 'rw-me-02', 'rw-me-08', 'rw-we-07'], slots: ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((time) => ({ time, capacity: 4 })), tone: 'sage' },
  ];
}

export function createSeed(): AppState {
  const today = todayISO();
  const products = buildCatalogue(today);
  const rand = rng(20251125);
  const units: InventoryUnit[] = [];
  for (const p of products) {
    for (const size of p.sizes) {
      const n = unitsPerSize(p);
      for (let i = 1; i <= n; i++) {
        units.push({ id: `${p.id}-${size.replace(/\s+/g, '').toLowerCase()}-${i}`, productId: p.id, size, status: 'available', condition: p.condition, rentalCycles: 0, lastCleaned: addDays(today, -Math.floor(rand() * 20) - 2) });
      }
    }
  }

  const bookings: Booking[] = [];
  const payments: Payment[] = [];
  const cleaning: CleaningRecord[] = [];
  const repairs: RepairRecord[] = [];
  const weighted = products.flatMap((p) => Array(Math.max(1, Math.round(p.popularity / 20))).fill(p));
  const locations = DEFAULT_POLICIES.pickupLocations;

  // Seeded demonstration bookings across the previous four months, flagged demo: true.
  const N = 46;
  for (let i = 0; i < N; i++) {
    const p = weighted[Math.floor(rand() * weighted.length)];
    const size = p.sizes[Math.floor(rand() * p.sizes.length)];
    const pool = units.filter((u) => u.productId === p.id && u.size === size);
    const unit = pool[Math.floor(rand() * pool.length)];
    const daysAgo = Math.floor(8 + rand() * 115);
    const start = addDays(today, -daysAgo);
    const days: 2 | 3 = rand() > 0.7 ? 3 : 2;
    const fee = p.rentalPrice + (days === 3 ? DEFAULT_POLICIES.surcharge72 : 0);
    const id = `RWC-D${String(i + 1).padStart(4, '0')}`;
    const late = rand() > 0.9;
    unit.rentalCycles += 1;
    bookings.push({
      id, studentId: `demo-${(i % 17) + 1}`, status: 'refunded', pickupLocation: locations[i % 3], pickupSlot: DEFAULT_POLICIES.pickupSlots[i % 4],
      paymentMethod: (['upi', 'card', 'pickup'] as const)[i % 3], rentalPaid: fee, depositHeld: p.deposit, creditsRedeemed: 0,
      createdAt: addDays(start, -3) + 'T10:00:00.000Z', contact: { name: `Demo student ${(i % 17) + 1}`, college: 'Demo data', phone: '—', email: '—' },
      items: [{ lineId: `${id}-1`, productId: p.id, unitId: unit.id, size, start, days, rentalFee: fee, discount: 0, creditUsed: false, deposit: p.deposit }],
      depositRefunded: p.deposit, returnedAt: addDays(start, days + (late ? 1 : 0)), history: [{ at: start, status: 'refunded', note: late ? 'Returned one day late' : undefined }], demo: true,
    });
    payments.push({ id: `${id}-r`, ref: id, kind: 'rental', amount: fee, method: 'upi', status: 'paid', at: start, demo: true });
    payments.push({ id: `${id}-d`, ref: id, kind: 'deposit', amount: p.deposit, method: 'upi', status: 'refunded', at: start, demo: true });
    cleaning.push({ id: `CL-D${i + 1}`, unitId: unit.id, date: addDays(start, days + 1), cost: DEFAULT_POLICIES.cleaningCost + (p.line === 'ethnic' && p.tier === 'premium' ? 80 : 0), status: 'done', demo: true });
    if (i % 13 === 5) repairs.push({ id: `RP-D${i}`, unitId: unit.id, date: addDays(start, days + 1), cost: 150 + (i % 3) * 50, note: ['Loose button re-stitched', 'Hem re-sewn', 'Lining seam repaired'][i % 3], status: 'done', demo: true });
  }

  // Two live demo bookings for the admin walkthrough (one ready for pickup, one collected).
  const live: [string, string, BookingStatus, number][] = [['rw-wf-01', 'S', 'ready', 1], ['rw-me-01', 'L', 'collected', -1]];
  live.forEach(([pid, size, status, offset], k) => {
    const p = products.find((x) => x.id === pid)!;
    const unit = units.find((u) => u.productId === pid && u.size === size)!;
    const id = `RWC-D${String(N + k + 1).padStart(4, '0')}`;
    const start = addDays(today, offset);
    bookings.push({
      id, studentId: `demo-${20 + k}`, status, pickupLocation: locations[k], pickupSlot: DEFAULT_POLICIES.pickupSlots[1],
      paymentMethod: 'upi', rentalPaid: p.rentalPrice, depositHeld: p.deposit, creditsRedeemed: 0, createdAt: addDays(today, -4) + 'T09:00:00.000Z',
      contact: { name: `Demo student ${20 + k}`, college: 'Demo data', phone: '—', email: '—' },
      items: [{ lineId: `${id}-1`, productId: pid, unitId: unit.id, size, start, days: 2, rentalFee: p.rentalPrice, discount: 0, creditUsed: false, deposit: p.deposit }],
      history: [{ at: addDays(today, -4), status: 'reserved' }, { at: addDays(today, -1), status: 'ready' }, ...(status === 'collected' ? [{ at: start, status: 'collected' as const }] : [])], demo: true,
    });
    payments.push({ id: `${id}-r`, ref: id, kind: 'rental', amount: p.rentalPrice, method: 'upi', status: 'paid', at: addDays(today, -4), demo: true });
    payments.push({ id: `${id}-d`, ref: id, kind: 'deposit', amount: p.deposit, method: 'upi', status: 'paid', at: addDays(today, -4), demo: true });
  });

  // One completed rental for the demo student, so My Wardrobe opens with history.
  {
    const p = products.find((x) => x.id === 'rw-mf-05')!;
    const unit = units.find((u) => u.productId === p.id && u.size === 'M')!;
    unit.rentalCycles += 1;
    const id = 'RWC-D0100';
    const start = addDays(today, -21);
    bookings.push({
      id, studentId: 'student-demo', status: 'refunded', pickupLocation: locations[0], pickupSlot: DEFAULT_POLICIES.pickupSlots[0], paymentMethod: 'upi',
      rentalPaid: 299, depositHeld: 500, creditsRedeemed: 0, createdAt: addDays(start, -2) + 'T08:00:00.000Z', contact: { name: 'Demo Student', college: 'CHRIST University, Central Campus', phone: '—', email: '—' },
      items: [{ lineId: `${id}-1`, productId: p.id, unitId: unit.id, size: 'M', start, days: 2, rentalFee: 299, discount: 0, creditUsed: false, deposit: 500 }],
      depositRefunded: 500, returnedAt: addDays(start, 2), history: [{ at: addDays(start, -2), status: 'reserved' }, { at: start, status: 'collected' }, { at: addDays(start, 2), status: 'returned' }, { at: addDays(start, 3), status: 'refunded' }], demo: true,
    });
    payments.push({ id: `${id}-r`, ref: id, kind: 'rental', amount: 299, method: 'upi', status: 'paid', at: start, demo: true });
    payments.push({ id: `${id}-d`, ref: id, kind: 'deposit', amount: 500, method: 'upi', status: 'refunded', at: start, demo: true });
  }

  // Seeded demo memberships (other students) for subscription analytics.
  const subscriptions: Subscription[] = [];
  for (let i = 0; i < 14; i++) {
    const plan = PLANS[i % 7 < 3 ? 1 : i % 7 < 5 ? 0 : 2];
    const startedAt = addDays(today, -Math.floor(5 + rand() * 110));
    const expiresAt = addDays(startedAt, 30);
    const active = expiresAt >= today;
    subscriptions.push({ id: `SUB-D${i + 1}`, studentId: `demo-${30 + i}`, planId: plan.id, startedAt, expiresAt, creditsTotal: plan.credits, creditsUsed: active ? Math.floor(rand() * plan.credits) : plan.credits, status: active ? 'active' : 'expired', paid: plan.price, redemptions: [], demo: true });
    payments.push({ id: `SUB-D${i + 1}-p`, ref: `SUB-D${i + 1}`, kind: 'subscription', amount: plan.price, method: 'upi', status: 'paid', at: startedAt, demo: true });
  }

  const evs = events(today);
  const appointments: Appointment[] = [];
  evs.forEach((e, ei) => e.slots.forEach((s, si) => {
    const taken = Math.floor(rand() * (s.capacity)) - (ei === 0 && si === 0 ? -5 : 0);
    for (let k = 0; k < Math.min(taken, s.capacity); k++) appointments.push({ id: `AP-D${ei}${si}${k}`, eventId: e.id, studentId: `demo-${50 + k}`, slot: s.time, kind: 'fitting', status: 'booked', createdAt: today, demo: true });
  }));

  return {
    version: STATE_VERSION, role: 'student',
    student: { id: 'student-demo', name: 'Demo Student', college: 'CHRIST University, Central Campus', phone: '', email: '', programme: 'BBA, 2nd year' },
    products, units, bookings, subscriptions, events: evs, appointments, payments, cleaning, repairs, feedback: [],
    wishlist: ['rw-we-01', 'rw-mf-03'], bag: [], policies: DEFAULT_POLICIES, seededAt: today,
  };
}
