import type { ArtKind, Condition, Gender, Line, Measurement, Occasion, Product, Tier } from './types';

// Size charts in inches (garment measurements, not body measurements).
type Chart = Record<string, Record<string, string>>;
const CHARTS: Record<string, Chart> = {
  'jacket-m': {
    S: { Chest: '38', Shoulder: '17', Length: '28', Sleeve: '24.5' },
    M: { Chest: '40', Shoulder: '17.5', Length: '29', Sleeve: '25' },
    L: { Chest: '42', Shoulder: '18', Length: '29.5', Sleeve: '25.5' },
    XL: { Chest: '44', Shoulder: '18.5', Length: '30', Sleeve: '26' },
  },
  'jacket-w': {
    XS: { Bust: '33', Waist: '28', Shoulder: '14', Length: '24' },
    S: { Bust: '35', Waist: '30', Shoulder: '14.5', Length: '24.5' },
    M: { Bust: '37', Waist: '32', Shoulder: '15', Length: '25' },
    L: { Bust: '39', Waist: '34', Shoulder: '15.5', Length: '25.5' },
  },
  'shirt-m': {
    S: { Chest: '38', Shoulder: '17', Length: '29', Collar: '15' },
    M: { Chest: '40', Shoulder: '17.5', Length: '29.5', Collar: '15.5' },
    L: { Chest: '42', Shoulder: '18', Length: '30', Collar: '16' },
    XL: { Chest: '44', Shoulder: '18.5', Length: '30.5', Collar: '16.5' },
  },
  'shirt-w': {
    XS: { Bust: '33', Shoulder: '14', Length: '25' },
    S: { Bust: '35', Shoulder: '14.5', Length: '25.5' },
    M: { Bust: '37', Shoulder: '15', Length: '26' },
    L: { Bust: '39', Shoulder: '15.5', Length: '26.5' },
  },
  'trousers-m': {
    '30': { Waist: '30', Hip: '38', Inseam: '31', Length: '41' },
    '32': { Waist: '32', Hip: '40', Inseam: '31.5', Length: '41.5' },
    '34': { Waist: '34', Hip: '42', Inseam: '32', Length: '42' },
    '36': { Waist: '36', Hip: '44', Inseam: '32', Length: '42.5' },
  },
  'trousers-w': {
    '26': { Waist: '26', Hip: '36', Inseam: '29', Length: '39' },
    '28': { Waist: '28', Hip: '38', Inseam: '29.5', Length: '39.5' },
    '30': { Waist: '30', Hip: '40', Inseam: '30', Length: '40' },
    '32': { Waist: '32', Hip: '42', Inseam: '30', Length: '40' },
  },
  'kurta-m': {
    S: { Chest: '40', Shoulder: '17', Length: '40', 'Pyjama waist': '28–32' },
    M: { Chest: '42', Shoulder: '17.5', Length: '41', 'Pyjama waist': '30–34' },
    L: { Chest: '44', Shoulder: '18', Length: '42', 'Pyjama waist': '32–36' },
    XL: { Chest: '46', Shoulder: '18.5', Length: '43', 'Pyjama waist': '34–38' },
  },
  'long-w': {
    XS: { Bust: '32', Waist: '27', Length: '46' },
    S: { Bust: '34', Waist: '29', Length: '46' },
    M: { Bust: '36', Waist: '31', Length: '47' },
    L: { Bust: '38', Waist: '33', Length: '47' },
  },
  saree: {
    'Blouse 34': { 'Saree length': '5.5 m', 'Blouse bust': '34', 'Blouse length': '14' },
    'Blouse 36': { 'Saree length': '5.5 m', 'Blouse bust': '36', 'Blouse length': '14.5' },
    'Blouse 38': { 'Saree length': '5.5 m', 'Blouse bust': '38', 'Blouse length': '15' },
  },
  lehenga: {
    XS: { 'Blouse bust': '32', 'Skirt waist': '26', 'Skirt length': '41' },
    S: { 'Blouse bust': '34', 'Skirt waist': '28', 'Skirt length': '41' },
    M: { 'Blouse bust': '36', 'Skirt waist': '30', 'Skirt length': '42' },
    L: { 'Blouse bust': '38', 'Skirt waist': '32', 'Skirt length': '42' },
  },
};

const toMeasurements = (chart: Chart): Record<string, Measurement[]> =>
  Object.fromEntries(Object.entries(chart).map(([size, m]) => [size, Object.entries(m).map(([label, value]) => ({ label, value: `${value}${/m$|–/.test(value) ? '' : '"'}` }))]));

interface Seed {
  id: string; name: string; gender: Gender; line: Line; category: string; tier: Tier; elite?: boolean;
  art: ArtKind; color: string; hex: string; accent?: string; family: string;
  price: number; retail: number; deposit: number; chart: keyof typeof CHARTS; omit?: string[];
  occasions: Occasion[]; fabric: string; condition?: Condition; styling: string[]; care?: string; added: number; pop: number;
}

const DRY = 'Professionally dry-cleaned between rentals. Please do not wash, iron at high heat or alter. Return on the hanger and in the garment bag provided.';
const STEAM = 'Steamed and sanitised between rentals. Hang after wear and avoid perfume directly on fabric. Return in the garment bag provided.';

const SEEDS: Seed[] = [
  // Men's formal
  { id: 'rw-mf-01', name: 'Classic Navy Placement Blazer', gender: 'men', line: 'formal', category: 'Blazer', tier: 'standard', art: 'blazer', color: 'Navy', hex: '#1f2f4d', accent: '#f4f2ec', family: 'Blue', price: 399, retail: 2500, deposit: 1000, chart: 'jacket-m', occasions: ['placements', 'presentations', 'farewell'], fabric: 'Poly-viscose suiting, half-lined, notch lapel, two-button front', styling: ['White formal shirt and charcoal trousers for interviews', 'Swap to an open collar and beige trousers for a farewell dinner'], added: 40, pop: 98 },
  { id: 'rw-mf-02', name: 'Black Formal Blazer', gender: 'men', line: 'formal', category: 'Blazer', tier: 'standard', art: 'blazer', color: 'Black', hex: '#1b1d1c', accent: '#f4f2ec', family: 'Black', price: 399, retail: 2800, deposit: 1000, chart: 'jacket-m', occasions: ['presentations', 'farewell', 'weddings'], fabric: 'Matte poly-wool blend, fully lined, notch lapel', styling: ['Black-on-white for a sharp conference look', 'Wear over a dark kurta for an indo-western reception'], added: 32, pop: 86 },
  { id: 'rw-mf-03', name: 'Charcoal Business Suit', gender: 'men', line: 'formal', category: 'Suit', tier: 'premium', elite: true, art: 'suit', color: 'Charcoal', hex: '#3a3d40', accent: '#f4f2ec', family: 'Grey', price: 699, retail: 7500, deposit: 1500, chart: 'jacket-m', occasions: ['placements', 'presentations', 'weddings'], fabric: 'Two-piece suit in wool-rich twill, flat-front trousers', styling: ['Pale blue shirt and a navy tie for final-round interviews', 'Drop the tie for an evening reception'], added: 20, pop: 92 },
  { id: 'rw-mf-04', name: 'Grey Tailored Blazer', gender: 'men', line: 'formal', category: 'Blazer', tier: 'premium', elite: true, art: 'blazer', color: 'Heather Grey', hex: '#7c8186', accent: '#f4f2ec', family: 'Grey', price: 499, retail: 3800, deposit: 1000, chart: 'jacket-m', occasions: ['presentations', 'farewell', 'fests'], fabric: 'Textured wool blend, slim cut, patch-free front', styling: ['Navy trousers and a white shirt for case competitions', 'Layer over a fine-knit polo for a smart-casual look'], added: 6, pop: 71 },
  { id: 'rw-mf-05', name: 'Premium White Formal Shirt', gender: 'men', line: 'formal', category: 'Shirt', tier: 'standard', art: 'shirt', color: 'White', hex: '#f1f0eb', family: 'White', price: 299, retail: 1500, deposit: 500, chart: 'shirt-m', occasions: ['placements', 'presentations', 'farewell'], fabric: '100% cotton poplin, spread collar, single cuff', condition: 'Like new', care: STEAM, styling: ['The base layer for every interview outfit', 'Pair with the navy blazer for the classic combination'], added: 28, pop: 88 },
  { id: 'rw-mf-06', name: 'Blue Formal Shirt', gender: 'men', line: 'formal', category: 'Shirt', tier: 'standard', art: 'shirt', color: 'Sky Blue', hex: '#a9c3dd', family: 'Blue', price: 299, retail: 1400, deposit: 500, chart: 'shirt-m', occasions: ['placements', 'presentations'], fabric: 'Cotton-rich oxford weave, button-down collar', care: STEAM, styling: ['Works under charcoal or navy', 'Sleeves rolled with beige trousers for daytime events'], added: 25, pop: 64 },
  { id: 'rw-mf-07', name: 'Black Formal Trousers', gender: 'men', line: 'formal', category: 'Trousers', tier: 'standard', art: 'trousers', color: 'Black', hex: '#1e2021', family: 'Black', price: 299, retail: 1600, deposit: 500, chart: 'trousers-m', occasions: ['placements', 'presentations', 'farewell'], fabric: 'Poly-viscose, flat front, slim straight leg', styling: ['Pairs with every blazer in the collection', 'Black belt and oxfords keep it clean'], added: 30, pop: 74 },
  { id: 'rw-mf-08', name: 'Beige Formal Trousers', gender: 'men', line: 'formal', category: 'Trousers', tier: 'standard', art: 'trousers', color: 'Beige', hex: '#cbb48e', family: 'Beige', price: 299, retail: 1600, deposit: 500, chart: 'trousers-m', occasions: ['presentations', 'farewell', 'fests'], fabric: 'Cotton-stretch twill, flat front, tapered leg', styling: ['Navy blazer and white shirt for a lighter formal look', 'Brown loafers rather than black shoes'], added: 12, pop: 52 },
  { id: 'rw-mf-09', name: 'Complete Interview Outfit', gender: 'men', line: 'formal', category: 'Outfit set', tier: 'premium', elite: true, art: 'interview-set', color: 'Navy & White', hex: '#1f2f4d', accent: '#f1f0eb', family: 'Blue', price: 699, retail: 5600, deposit: 1500, chart: 'jacket-m', occasions: ['placements', 'presentations'], fabric: 'Navy blazer, white cotton shirt, charcoal trousers and a silk-blend tie', styling: ['Everything for a placement interview in one booking', 'Add black oxfords and a plain watch'], added: 3, pop: 95 },
  // Women's formal
  { id: 'rw-wf-01', name: 'Classic Black Blazer', gender: 'women', line: 'formal', category: 'Blazer', tier: 'standard', art: 'blazer-w', color: 'Black', hex: '#1c1d1d', accent: '#f4f2ec', family: 'Black', price: 399, retail: 2600, deposit: 1000, chart: 'jacket-w', occasions: ['placements', 'presentations', 'farewell'], fabric: 'Crepe suiting, single button, shaped waist, half-lined', styling: ['White shirt and black trousers for interviews', 'Over a slip dress for farewell night'], added: 35, pop: 93 },
  { id: 'rw-wf-02', name: 'Beige Structured Blazer', gender: 'women', line: 'formal', category: 'Blazer', tier: 'premium', elite: true, art: 'blazer-w', color: 'Sand Beige', hex: '#c9b28d', accent: '#f4f2ec', family: 'Beige', price: 499, retail: 3900, deposit: 1000, chart: 'jacket-w', occasions: ['presentations', 'farewell', 'fests'], fabric: 'Structured twill with defined shoulders, single button', styling: ['Ivory shirt and wide-leg trousers', 'Gold studs and nude block heels'], added: 5, pop: 82 },
  { id: 'rw-wf-03', name: 'Navy Formal Blazer', gender: 'women', line: 'formal', category: 'Blazer', tier: 'standard', art: 'blazer-w', color: 'Navy', hex: '#22304d', accent: '#f4f2ec', family: 'Blue', price: 399, retail: 2600, deposit: 1000, chart: 'jacket-w', occasions: ['placements', 'presentations'], fabric: 'Poly-viscose, notch lapel, single button', styling: ['Sky-blue shirt and black trousers', 'Pearl studs keep it understated'], added: 22, pop: 70 },
  { id: 'rw-wf-04', name: 'Charcoal Pantsuit', gender: 'women', line: 'formal', category: 'Pantsuit', tier: 'premium', elite: true, art: 'pantsuit', color: 'Charcoal', hex: '#3b3e42', accent: '#f4f2ec', family: 'Grey', price: 599, retail: 5800, deposit: 1500, chart: 'jacket-w', occasions: ['placements', 'presentations', 'weddings'], fabric: 'Matching blazer and high-rise straight trousers in suiting twill', styling: ['White shell top for interviews', 'Satin camisole for an evening event'], added: 8, pop: 90 },
  { id: 'rw-wf-05', name: 'White Formal Shirt', gender: 'women', line: 'formal', category: 'Shirt', tier: 'standard', art: 'shirt-w', color: 'White', hex: '#f2f1ec', family: 'White', price: 299, retail: 1400, deposit: 500, chart: 'shirt-w', occasions: ['placements', 'presentations', 'farewell'], fabric: 'Cotton-stretch poplin, tailored fit, concealed placket', condition: 'Like new', care: STEAM, styling: ['Tuck into high-rise trousers', 'The base for any blazer in the collection'], added: 26, pop: 79 },
  { id: 'rw-wf-06', name: 'High-Rise Formal Trousers', gender: 'women', line: 'formal', category: 'Trousers', tier: 'standard', art: 'trousers-w', color: 'Black', hex: '#1f2021', family: 'Black', price: 299, retail: 1700, deposit: 500, chart: 'trousers-w', occasions: ['placements', 'presentations', 'farewell'], fabric: 'Crepe, high-rise, straight wide leg with pressed crease', styling: ['With the white shirt and black blazer', 'Pointed flats for long interview days'], added: 18, pop: 66 },
  { id: 'rw-wf-07', name: 'Complete Corporate Outfit', gender: 'women', line: 'formal', category: 'Outfit set', tier: 'premium', elite: true, art: 'corporate-set', color: 'Navy & Ivory', hex: '#22304d', accent: '#f2f1ec', family: 'Blue', price: 699, retail: 5400, deposit: 1500, chart: 'jacket-w', occasions: ['placements', 'presentations'], fabric: 'Navy blazer, ivory shirt and black high-rise trousers', styling: ['Ready for placement interviews in one booking', 'Add a structured tote and block heels'], added: 2, pop: 91 },
  // Men's ethnic
  { id: 'rw-me-01', name: 'Ivory Kurta Set', gender: 'men', line: 'ethnic', category: 'Kurta set', tier: 'standard', art: 'kurta', color: 'Ivory', hex: '#efe8d8', accent: '#e9e3d4', family: 'White', price: 399, retail: 2400, deposit: 1000, chart: 'kurta-m', occasions: ['ethnic-day', 'fests', 'weddings'], fabric: 'Cotton-silk kurta with mandarin collar and matching churidar', care: STEAM, styling: ['Tan kolhapuris for ethnic day', 'Add the Nehru jacket for an evening function'], added: 33, pop: 89 },
  { id: 'rw-me-02', name: 'Black Embroidered Kurta', gender: 'men', line: 'ethnic', category: 'Kurta set', tier: 'standard', art: 'kurta-embroidered', color: 'Black', hex: '#1d1d1f', accent: '#cfae6b', family: 'Black', price: 399, retail: 3200, deposit: 1000, chart: 'kurta-m', occasions: ['fests', 'farewell', 'weddings'], fabric: 'Viscose kurta with tonal-gold thread work on placket and hem, ivory pyjama', styling: ['Gold-toned juttis', 'Strong choice for farewell night photographs'], added: 14, pop: 84 },
  { id: 'rw-me-03', name: 'Royal Blue Kurta', gender: 'men', line: 'ethnic', category: 'Kurta set', tier: 'standard', art: 'kurta', color: 'Royal Blue', hex: '#26408b', accent: '#eae6da', family: 'Blue', price: 399, retail: 2600, deposit: 1000, chart: 'kurta-m', occasions: ['ethnic-day', 'fests', 'weddings'], fabric: 'Art-silk kurta with self-texture and white pyjama', care: STEAM, styling: ['White pyjama and tan sandals', 'Pairs with an ivory Nehru jacket'], added: 16, pop: 68 },
  { id: 'rw-me-04', name: 'Pastel Festive Kurta', gender: 'men', line: 'ethnic', category: 'Kurta set', tier: 'standard', art: 'kurta-embroidered', color: 'Mint Pastel', hex: '#bcd8c6', accent: '#e8e1cf', family: 'Green', price: 399, retail: 2800, deposit: 1000, chart: 'kurta-m', occasions: ['fests', 'ethnic-day', 'weddings'], fabric: 'Cotton-blend kurta with tonal thread work, ivory pyjama', care: STEAM, styling: ['Daytime haldi and mehendi functions', 'Light tan juttis'], added: 4, pop: 76 },
  { id: 'rw-me-05', name: 'Classic Nehru Jacket', gender: 'men', line: 'ethnic', category: 'Jacket', tier: 'standard', art: 'nehru', color: 'Bottle Green', hex: '#1f4a3a', accent: '#efe8d8', family: 'Green', price: 399, retail: 2800, deposit: 1000, chart: 'jacket-m', occasions: ['ethnic-day', 'weddings', 'farewell'], fabric: 'Jacquard bandhgala-collar waistcoat, fully lined', styling: ['Over an ivory or white kurta', 'Over a white shirt for a fusion look'], added: 19, pop: 72 },
  { id: 'rw-me-06', name: 'Traditional Sherwani', gender: 'men', line: 'ethnic', category: 'Sherwani', tier: 'premium', art: 'sherwani', color: 'Ivory Gold', hex: '#e9dfc6', accent: '#b8914a', family: 'Gold', price: 699, retail: 12000, deposit: 2000, chart: 'kurta-m', occasions: ['weddings', 'farewell'], fabric: 'Raw-silk sherwani with zari embroidery, churidar included', styling: ['Embroidered mojaris and a maroon stole', 'Book the 72-hour option for multi-day weddings'], added: 10, pop: 80 },
  { id: 'rw-me-07', name: 'Complete Ethnic Outfit', gender: 'men', line: 'ethnic', category: 'Outfit set', tier: 'premium', elite: true, art: 'ethnic-set-m', color: 'Ivory & Maroon', hex: '#efe8d8', accent: '#6e2330', family: 'Red', price: 599, retail: 5200, deposit: 1500, chart: 'kurta-m', occasions: ['ethnic-day', 'weddings', 'fests'], fabric: 'Ivory kurta, churidar and maroon brocade Nehru jacket', styling: ['A ready-styled look for ethnic day', 'Add tan juttis'], added: 1, pop: 87 },
  { id: 'rw-me-08', name: 'Midnight Bandhgala Jacket', gender: 'men', line: 'ethnic', category: 'Jacket', tier: 'premium', elite: true, art: 'bandhgala', color: 'Midnight Blue', hex: '#1b2540', accent: '#c7a764', family: 'Blue', price: 599, retail: 6800, deposit: 1500, chart: 'jacket-m', occasions: ['weddings', 'farewell', 'presentations'], fabric: 'Full-sleeve bandhgala in suiting blend with metal buttons', styling: ['Matching trousers or white churidar', 'Brown brogues for a reception'], added: 7, pop: 63 },
  // Women's ethnic
  { id: 'rw-we-01', name: 'Elegant Silk Saree', gender: 'women', line: 'ethnic', category: 'Saree', tier: 'premium', elite: true, art: 'saree', color: 'Deep Maroon', hex: '#6e1f2e', accent: '#d1ad62', family: 'Red', price: 599, retail: 9000, deposit: 1500, chart: 'saree', occasions: ['weddings', 'farewell', 'ethnic-day'], fabric: 'Art-silk saree with zari border and pallu, stitched blouse in your size', styling: ['Temple-style earrings and a low bun', 'Gold block heels or flats'], added: 13, pop: 94 },
  { id: 'rw-we-02', name: 'Pastel Festive Saree', gender: 'women', line: 'ethnic', category: 'Saree', tier: 'standard', art: 'saree', color: 'Blush Pink', hex: '#e7bfbd', accent: '#c9a45f', family: 'Pink', price: 499, retail: 4500, deposit: 1500, chart: 'saree', occasions: ['fests', 'ethnic-day', 'farewell'], fabric: 'Georgette saree with sequin border, stitched blouse included', styling: ['Pearl drops for farewell night', 'Pleat at the hostel and walk to the venue'], added: 9, pop: 90 },
  { id: 'rw-we-03', name: 'Embroidered Anarkali', gender: 'women', line: 'ethnic', category: 'Anarkali', tier: 'premium', elite: true, art: 'anarkali', color: 'Emerald', hex: '#1d5c49', accent: '#d3b06c', family: 'Green', price: 599, retail: 6500, deposit: 1500, chart: 'long-w', occasions: ['weddings', 'fests', 'farewell'], fabric: 'Floor-length georgette Anarkali with zari yoke, churidar and dupatta', styling: ['Statement jhumkas, hair left open', 'Gold juttis'], added: 11, pop: 85 },
  { id: 'rw-we-04', name: 'Traditional Kurta Set', gender: 'women', line: 'ethnic', category: 'Kurta set', tier: 'standard', art: 'kurta-w', color: 'Mustard', hex: '#c99a33', accent: '#f1ead9', family: 'Yellow', price: 399, retail: 2600, deposit: 1000, chart: 'long-w', occasions: ['ethnic-day', 'fests', 'presentations'], fabric: 'Cotton kurta with block-print detail, palazzo and dupatta', care: STEAM, styling: ['Oxidised silver jhumkas', 'Kolhapuris for a full day on campus'], added: 24, pop: 78 },
  { id: 'rw-we-05', name: 'Contemporary Ethnic Dress', gender: 'women', line: 'ethnic', category: 'Dress', tier: 'standard', art: 'dress', color: 'Terracotta', hex: '#b9603f', accent: '#e9c98d', family: 'Orange', price: 399, retail: 2900, deposit: 1000, chart: 'long-w', occasions: ['fests', 'farewell', 'ethnic-day'], fabric: 'Flared midi in rayon crepe with V-neck and gota trim', care: STEAM, styling: ['Tie-up belt and block heels', 'Easy to wear for a full fest day'], added: 15, pop: 69 },
  { id: 'rw-we-06', name: 'Festive Lehenga', gender: 'women', line: 'ethnic', category: 'Lehenga', tier: 'premium', art: 'lehenga', color: 'Rani Pink', hex: '#b72d63', accent: '#d8b469', family: 'Pink', price: 699, retail: 14000, deposit: 2000, chart: 'lehenga', occasions: ['weddings', 'farewell'], fabric: 'Silk-blend lehenga with embroidered border, blouse and net dupatta', styling: ['Choose 72 hours for sangeet and wedding', 'Polki jewellery and a soft bun'], added: 17, pop: 88 },
  { id: 'rw-we-07', name: 'Premium Occasion-Wear Set', gender: 'women', line: 'ethnic', category: 'Outfit set', tier: 'premium', art: 'occasion-set-w', color: 'Midnight & Gold', hex: '#1f2a44', accent: '#d2ae66', family: 'Blue', price: 699, retail: 9500, deposit: 2000, chart: 'long-w', occasions: ['weddings', 'farewell', 'fests'], fabric: 'Embroidered kurta, sharara and organza dupatta', styling: ['Statement earrings, nothing at the neck', 'Strong for evening receptions'], added: 6, pop: 81 },
  { id: 'rw-we-08', name: 'Sage Indo-Western Co-ord', gender: 'women', line: 'ethnic', category: 'Outfit set', tier: 'standard', art: 'coord-w', color: 'Sage', hex: '#9fb79a', accent: '#efe9da', family: 'Green', price: 499, retail: 3900, deposit: 1000, chart: 'long-w', occasions: ['fests', 'presentations', 'ethnic-day'], fabric: 'Linen-blend jacket-style top with straight trousers', care: STEAM, styling: ['Works for ethnic day and an afternoon presentation', 'White sneakers or tan flats'], added: 0, pop: 60 },
];

export function buildCatalogue(today: string): Product[] {
  const base = new Date(today + 'T00:00:00');
  return SEEDS.map((s) => {
    const chart = CHARTS[s.chart];
    const d = new Date(base); d.setDate(d.getDate() - s.added * 3);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      id: s.id, name: s.name, gender: s.gender, line: s.line, category: s.category, tier: s.tier,
      eliteEligible: !!s.elite, art: s.art, color: s.color, hex: s.hex, accent: s.accent, colorFamily: s.family,
      rentalPrice: s.price, retailPrice: s.retail, deposit: s.deposit,
      sizes: Object.keys(chart), measurements: toMeasurements(chart), occasions: s.occasions, fabric: s.fabric,
      condition: s.condition ?? (s.pop > 85 ? 'Excellent' : 'Very good'), styling: s.styling, care: s.care ?? DRY,
      addedOn: iso, popularity: s.pop, blockedDates: [], archived: false,
    } satisfies Product;
  });
}

export const OCCASIONS: { id: Occasion; label: string; short: string; blurb: string }[] = [
  { id: 'placements', label: 'Placements & Interviews', short: 'Placements', blurb: 'Interview-ready blazers, suits and shirts' },
  { id: 'presentations', label: 'Presentations & Conferences', short: 'Presentations', blurb: 'Sharp looks for the front of the room' },
  { id: 'fests', label: 'College Festivals', short: 'Fests', blurb: 'Statement pieces for fest nights' },
  { id: 'ethnic-day', label: 'Ethnic Day', short: 'Ethnic Day', blurb: 'Kurtas, sarees and sets for the whole day' },
  { id: 'farewell', label: 'Farewell & Graduation', short: 'Farewell', blurb: 'The photographs will last. The bill will not.' },
  { id: 'weddings', label: 'Weddings & Celebrations', short: 'Weddings', blurb: 'Sherwanis, lehengas and silk sarees' },
];

export const STYLES = [
  { id: 'men-formal', label: "Men's Formal Wear", gender: 'men', line: 'formal' },
  { id: 'women-formal', label: "Women's Formal Wear", gender: 'women', line: 'formal' },
  { id: 'men-ethnic', label: "Men's Ethnic Wear", gender: 'men', line: 'ethnic' },
  { id: 'women-ethnic', label: "Women's Ethnic Wear", gender: 'women', line: 'ethnic' },
  { id: 'sets', label: 'Complete Outfit Sets', gender: null, line: null },
] as const;

/** Inventory depth per size for the pilot rack (units per size). */
export function unitsPerSize(p: Product): number {
  if (p.tier === 'premium') return p.popularity >= 88 ? 2 : 1;
  return p.popularity >= 80 ? 3 : 2;
}
