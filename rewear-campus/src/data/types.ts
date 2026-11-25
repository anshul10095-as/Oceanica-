// Domain model for ReWear Campus. Every screen reads from one AppState (see store/store.tsx).

export type Gender = 'men' | 'women';
export type Line = 'formal' | 'ethnic';
export type Tier = 'standard' | 'premium';
export type Occasion = 'placements' | 'presentations' | 'fests' | 'ethnic-day' | 'farewell' | 'weddings';
export type ArtKind =
  | 'blazer' | 'blazer-w' | 'shirt' | 'shirt-w' | 'trousers' | 'trousers-w' | 'suit' | 'pantsuit'
  | 'interview-set' | 'corporate-set' | 'kurta' | 'kurta-embroidered' | 'sherwani' | 'nehru'
  | 'ethnic-set-m' | 'saree' | 'anarkali' | 'kurta-w' | 'dress' | 'lehenga' | 'occasion-set-w' | 'coord-w' | 'bandhgala';

export type Condition = 'Like new' | 'Excellent' | 'Very good' | 'Good';

export interface Measurement { label: string; value: string }

export interface Product {
  id: string;
  name: string;
  gender: Gender;
  line: Line;
  category: string; // Blazer, Shirt, Trousers, Suit, Pantsuit, Outfit set, Kurta set, Sherwani, Jacket, Saree, Anarkali, Lehenga, Dress
  tier: Tier;
  eliteEligible: boolean; // premium items that Campus Elite credits can cover
  art: ArtKind;
  color: string; // display name
  hex: string;
  accent?: string; // trim, embroidery or second garment colour
  colorFamily: string; // filter bucket
  rentalPrice: number; // 48-hour price, INR
  retailPrice: number; // estimated retail, INR
  deposit: number; // refundable
  sizes: string[];
  measurements: Record<string, Measurement[]>;
  occasions: Occasion[];
  fabric: string;
  condition: Condition;
  styling: string[];
  care: string;
  addedOn: string; // ISO date
  popularity: number; // seed ranking 0-100
  imageUrl?: string; // optional real photograph; illustration is the fallback
  blockedDates: string[]; // ISO dates on which the product cannot be rented
  archived: boolean;
}

export type UnitStatus = 'available' | 'cleaning' | 'repair' | 'retired';

export interface InventoryUnit {
  id: string;
  productId: string;
  size: string;
  status: UnitStatus;
  condition: Condition;
  rentalCycles: number;
  lastCleaned: string | null;
}

export type BookingStatus = 'reserved' | 'ready' | 'collected' | 'returned' | 'qc' | 'refunded' | 'cancelled';

export interface BookingItem {
  lineId: string;
  productId: string;
  unitId: string;
  size: string;
  start: string; // ISO date of pickup
  days: 2 | 3;
  rentalFee: number; // list price for duration before discounts
  discount: number;
  creditUsed: boolean;
  deposit: number;
}

export interface Booking {
  id: string;
  studentId: string;
  items: BookingItem[];
  status: BookingStatus;
  pickupLocation: string;
  pickupSlot: string;
  paymentMethod: 'upi' | 'card' | 'pickup';
  rentalPaid: number; // recognised rental revenue (after discounts and credits)
  depositHeld: number;
  creditsRedeemed: number;
  createdAt: string;
  contact: { name: string; college: string; phone: string; email: string };
  extension?: { days: number; fee: number; status: 'requested' | 'approved' | 'rejected'; reason?: string };
  cancellationRequested?: boolean;
  damage?: { note: string; charge: number };
  depositRefunded?: number;
  returnedAt?: string;
  history: { at: string; status: BookingStatus | 'note'; note?: string }[];
  demo?: boolean;
}

export interface Plan {
  id: 'basic' | 'plus' | 'elite';
  name: string;
  price: number;
  credits: number;
  discount: number; // % off additional paid rentals
  premiumAccess: boolean;
  priority: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  studentId: string;
  planId: Plan['id'];
  startedAt: string;
  expiresAt: string;
  creditsTotal: number;
  creditsUsed: number;
  status: 'active' | 'cancel-requested' | 'cancelled' | 'expired';
  paid: number;
  redemptions: { bookingId: string; lineId: string; at: string }[];
  demo?: boolean;
}

export interface PopupSlot { time: string; capacity: number }
export interface PopupEvent {
  id: string;
  name: string;
  theme: string;
  date: string;
  start: string;
  end: string;
  location: string;
  categories: string[];
  productIds: string[];
  slots: PopupSlot[];
  tone: 'forest' | 'terra' | 'gold' | 'sage' | 'ink';
}

export interface Appointment {
  id: string;
  eventId: string;
  studentId: string;
  slot: string;
  kind: 'fitting' | 'pickup';
  productId?: string;
  size?: string;
  status: 'booked' | 'attended' | 'cancelled';
  createdAt: string;
  demo?: boolean;
}

export interface Payment {
  id: string;
  ref: string; // booking or subscription id
  kind: 'rental' | 'deposit' | 'subscription' | 'deposit-refund' | 'extension' | 'damage';
  amount: number;
  method: 'upi' | 'card' | 'pickup' | 'system';
  status: 'paid' | 'due' | 'refunded';
  at: string;
  demo?: boolean;
}

export interface CleaningRecord { id: string; unitId: string; date: string; cost: number; status: 'in-progress' | 'done'; demo?: boolean }
export interface RepairRecord { id: string; unitId: string; date: string; cost: number; note: string; status: 'in-progress' | 'done'; demo?: boolean }

export interface Feedback {
  id: string;
  at: string;
  frequency: string;
  categories: string[];
  cleanedOk: string;
  price: string;
  subscription: string;
  pickup: string;
  hygiene: string;
  likelihood: number;
  comments: string;
}

export interface Student {
  id: string;
  name: string;
  college: string;
  phone: string;
  email: string;
  programme: string;
}

export interface Policies {
  leadDays: number; // earliest pickup = today + leadDays
  maxAdvanceDays: number;
  bufferDays: number; // cleaning turnaround held after each return
  surcharge72: number; // added to 48h price for 72h
  extensionPerDay: number;
  freeCancelHours: number;
  cleaningCost: number; // default per cycle
  pickupLocations: string[];
  pickupSlots: string[];
  plans: Plan[];
}

export interface BagLine {
  lineId: string;
  productId: string;
  size: string;
  start: string;
  days: 2 | 3;
  useCredit: boolean;
}

export interface AppState {
  version: number;
  role: 'student' | 'admin';
  student: Student;
  products: Product[];
  units: InventoryUnit[];
  bookings: Booking[];
  subscriptions: Subscription[];
  events: PopupEvent[];
  appointments: Appointment[];
  payments: Payment[];
  cleaning: CleaningRecord[];
  repairs: RepairRecord[];
  feedback: Feedback[];
  wishlist: string[];
  bag: BagLine[];
  policies: Policies;
  seededAt: string;
}
