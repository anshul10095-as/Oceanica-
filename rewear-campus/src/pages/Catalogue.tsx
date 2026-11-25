import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import { useStore } from '../store/store';
import { useRouter } from '../lib/router';
import { ProductCard, ProductSkeleton } from '../components/Product';
import { Button, Chip, Empty, Modal } from '../components/ui';
import { OCCASIONS, STYLES } from '../data/catalogue';
import { findUnit } from '../store/rules';
import { addDays, cx, todayISO } from '../lib/util';
import type { Gender, Line, Occasion, Product } from '../data/types';

interface Filters { gender: Gender[]; line: Line[]; category: string[]; occasion: Occasion[]; size: string[]; color: string[]; price: number; date: string; q: string }
const EMPTY: Filters = { gender: [], line: [], category: [], occasion: [], size: [], color: [], price: 700, date: '', q: '' };
const SORTS = [['recommended', 'Recommended'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['new', 'New Arrivals'], ['popular', 'Popularity']] as const;
const SWATCH: Record<string, string> = { Black: '#1d1d1f', Blue: '#26408b', Grey: '#7c8186', White: '#f2f1ec', Beige: '#cbb48e', Green: '#1d5c49', Red: '#6e1f2e', Pink: '#e7bfbd', Gold: '#d4b477', Yellow: '#c99a33', Orange: '#b9603f' };
const sizeBucket = (s: string) => s.replace('Blouse ', '');

function fromRoute(page: string, arg: string): { f: Filters; title: string; sub: string } {
  const f = { ...EMPTY };
  if (page === 'formal') return { f: { ...f, line: ['formal'] }, title: 'Formal Wear', sub: 'Blazers, suits, shirts and trousers for interviews, presentations and placement season.' };
  if (page === 'ethnic') return { f: { ...f, line: ['ethnic'] }, title: 'Ethnic Wear', sub: 'Kurta sets, sarees, Anarkalis, lehengas and sherwanis for ethnic day, fests and weddings.' };
  if (page === 'occasion') { const o = OCCASIONS.find((x) => x.id === arg); if (o) return { f: { ...f, occasion: [o.id] }, title: o.label, sub: o.blurb + '.' }; }
  if (page === 'style') {
    const s = STYLES.find((x) => x.id === arg);
    if (s?.id === 'sets') return { f: { ...f, category: ['Outfit set', 'Suit', 'Pantsuit'] }, title: s.label, sub: 'Complete looks in a single booking.' };
    if (s) return { f: { ...f, gender: [s.gender as Gender], line: [s.line as Line] }, title: s.label, sub: '' };
  }
  if (page === 'search') return { f: { ...f, q: arg.replace(/-/g, ' ') }, title: `Results for “${arg.replace(/-/g, ' ')}”`, sub: '' };
  return { f, title: 'Explore the Collection', sub: 'Every garment is cleaned, checked and ready on a campus rack. Prices are proposed pilot rental prices for 48 hours.' };
}

function matches(p: Product, f: Filters) {
  if (p.archived) return false;
  if (f.gender.length && !f.gender.includes(p.gender)) return false;
  if (f.line.length && !f.line.includes(p.line)) return false;
  if (f.category.length && !f.category.includes(p.category)) return false;
  if (f.occasion.length && !f.occasion.some((o) => p.occasions.includes(o))) return false;
  if (f.size.length && !p.sizes.some((s) => f.size.includes(sizeBucket(s)))) return false;
  if (f.color.length && !f.color.includes(p.colorFamily)) return false;
  if (p.rentalPrice > f.price) return false;
  if (f.q) {
    const hay = `${p.name} ${p.category} ${p.color} ${p.colorFamily} ${p.line} ${p.gender === 'men' ? "men men's" : "women women's"} ${p.occasions.join(' ')} ${p.fabric}`.toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t.replace(/s$/, '')))) return false;
  }
  return true;
}

function FilterPanel({ f, set, products }: { f: Filters; set: (f: Filters) => void; products: Product[] }) {
  const toggle = <K extends 'gender' | 'line' | 'category' | 'occasion' | 'size' | 'color'>(k: K, v: Filters[K][number]) => {
    const arr = f[k] as string[];
    set({ ...f, [k]: arr.includes(v as string) ? arr.filter((x) => x !== v) : [...arr, v] });
  };
  const cats = [...new Set(products.map((p) => p.category))];
  const sizes = [...new Set(products.flatMap((p) => p.sizes.map(sizeBucket)))].sort((a, b) => (isNaN(+a) ? 1 : 0) - (isNaN(+b) ? 1 : 0) || (isNaN(+a) ? ['XS', 'S', 'M', 'L', 'XL'].indexOf(a) - ['XS', 'S', 'M', 'L', 'XL'].indexOf(b) : +a - +b));
  const colors = [...new Set(products.map((p) => p.colorFamily))];
  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <fieldset className="py-5 border-b border-line"><legend className="eyebrow text-muted mb-3 float-left w-full">{title}</legend><div className="clear-both flex flex-wrap gap-2">{children}</div></fieldset>
  );
  return (
    <div>
      <Group title="Fit"><Chip active={f.gender.includes('men')} onClick={() => toggle('gender', 'men')}>Men</Chip><Chip active={f.gender.includes('women')} onClick={() => toggle('gender', 'women')}>Women</Chip></Group>
      <Group title="Collection"><Chip active={f.line.includes('formal')} onClick={() => toggle('line', 'formal')}>Formal</Chip><Chip active={f.line.includes('ethnic')} onClick={() => toggle('line', 'ethnic')}>Ethnic</Chip></Group>
      <Group title="Category">{cats.map((c) => <Chip key={c} active={f.category.includes(c)} onClick={() => toggle('category', c)}>{c}</Chip>)}</Group>
      <Group title="Occasion">{OCCASIONS.map((o) => <Chip key={o.id} active={f.occasion.includes(o.id)} onClick={() => toggle('occasion', o.id)}>{o.short}</Chip>)}</Group>
      <Group title="Size">{sizes.map((s) => <Chip key={s} active={f.size.includes(s)} onClick={() => toggle('size', s)} className="min-w-[48px]">{s}</Chip>)}</Group>
      <Group title="Colour">{colors.map((c) => (
        <button key={c} type="button" aria-pressed={f.color.includes(c)} onClick={() => toggle('color', c)} className={cx('h-10 pl-1.5 pr-3 rounded-full border text-[13px] font-semibold inline-flex items-center gap-2', f.color.includes(c) ? 'border-brand ring-1 ring-brand' : 'border-line')}>
          <span className="h-7 w-7 rounded-full border border-black/10" style={{ background: SWATCH[c] ?? '#ccc' }} />{c}
        </button>))}</Group>
      <fieldset className="py-5 border-b border-line">
        <legend className="eyebrow text-muted mb-3">Rental price</legend>
        <label htmlFor="f-price" className="flex justify-between text-sm font-semibold tnum mt-2"><span>Up to</span><span>₹{f.price}</span></label>
        <input id="f-price" type="range" min={299} max={700} step={50} value={f.price} onChange={(e) => set({ ...f, price: +e.target.value })} className="w-full mt-2 accent-[#164B35]" />
      </fieldset>
      <fieldset className="py-5">
        <legend className="eyebrow text-muted mb-3">Available on</legend>
        <label htmlFor="f-date" className="sr-only">Pickup date</label>
        <input id="f-date" type="date" className="field mt-2" min={addDays(todayISO(), 1)} max={addDays(todayISO(), 60)} value={f.date} onChange={(e) => set({ ...f, date: e.target.value })} />
        <p className="text-[12px] text-muted mt-1.5">Shows garments with at least one unit free for a 48-hour rental from this date{f.size.length ? ' in your selected sizes' : ''}.</p>
      </fieldset>
    </div>
  );
}

export default function Catalogue() {
  const { route } = useRouter();
  const { state } = useStore();
  const base = useMemo(() => fromRoute(route.page, route.arg), [route.page, route.arg]);
  const [f, setF] = useState<Filters>(base.f);
  const [sort, setSort] = useState<string>('recommended');
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setF(base.f); setLoading(true); const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, [base]);

  const list = useMemo(() => {
    let out = state.products.filter((p) => matches(p, f));
    if (f.date) {
      const t = todayISO();
      if (f.date > t) out = out.filter((p) => p.sizes.filter((s) => !f.size.length || f.size.includes(sizeBucket(s))).some((s) => findUnit(state, p.id, s, f.date, 2).reason === 'ok'));
      else out = [];
    }
    const by: Record<string, (a: Product, b: Product) => number> = {
      recommended: (a, b) => b.popularity * 0.7 + (60 - a.rentalPrice / 12) * 0.3 - (a.popularity * 0.7 + (60 - b.rentalPrice / 12) * 0.3),
      'price-asc': (a, b) => a.rentalPrice - b.rentalPrice,
      'price-desc': (a, b) => b.rentalPrice - a.rentalPrice,
      new: (a, b) => b.addedOn.localeCompare(a.addedOn),
      popular: (a, b) => b.popularity - a.popularity,
    };
    return [...out].sort(by[sort]);
  }, [state, f, sort]);

  const activeCount = f.gender.length + f.line.length + f.category.length + f.occasion.length + f.size.length + f.color.length + (f.price < 700 ? 1 : 0) + (f.date ? 1 : 0);
  const pills: [string, () => void][] = [
    ...f.gender.map((v) => [v === 'men' ? 'Men' : 'Women', () => setF({ ...f, gender: f.gender.filter((x) => x !== v) })] as [string, () => void]),
    ...f.line.map((v) => [v === 'formal' ? 'Formal' : 'Ethnic', () => setF({ ...f, line: f.line.filter((x) => x !== v) })] as [string, () => void]),
    ...f.category.map((v) => [v, () => setF({ ...f, category: f.category.filter((x) => x !== v) })] as [string, () => void]),
    ...f.occasion.map((v) => [OCCASIONS.find((o) => o.id === v)!.short, () => setF({ ...f, occasion: f.occasion.filter((x) => x !== v) })] as [string, () => void]),
    ...f.size.map((v) => [`Size ${v}`, () => setF({ ...f, size: f.size.filter((x) => x !== v) })] as [string, () => void]),
    ...f.color.map((v) => [v, () => setF({ ...f, color: f.color.filter((x) => x !== v) })] as [string, () => void]),
    ...(f.price < 700 ? [[`Up to ₹${f.price}`, () => setF({ ...f, price: 700 })] as [string, () => void]] : []),
    ...(f.date ? [[`Free from ${f.date.slice(8)}/${f.date.slice(5, 7)}`, () => setF({ ...f, date: '' })] as [string, () => void]] : []),
    ...(f.q ? [[`“${f.q}”`, () => setF({ ...f, q: '' })] as [string, () => void]] : []),
  ];

  return (
    <div className="gutter max-w-[1440px] mx-auto pt-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="text-[12px] text-muted mb-3"><a href="#home" className="hover:text-fg">Home</a> / <span>{base.title}</span></nav>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-[38px] lg:text-[56px] font-semibold leading-none">{base.title}</h1>
          {base.sub && <p className="text-muted mt-3 max-w-[60ch]">{base.sub}</p>}
        </div>
      </div>
      <div className="sticky z-30 bg-bg/95 backdrop-blur -mx-4 px-4 lg:mx-0 lg:px-0 py-3 border-b border-line flex items-center gap-3" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 60px)' }}>
        <button type="button" onClick={() => setSheet(true)} className="lg:hidden h-10 px-4 rounded-full border border-line inline-flex items-center gap-2 text-[13px] font-semibold"><SlidersHorizontal size={16} />Filters{activeCount ? <span className="h-5 min-w-5 px-1 rounded-full bg-brand text-onbrand text-[11px] grid place-items-center">{activeCount}</span> : null}</button>
        <p className="text-[13px] text-muted tnum hidden sm:block" aria-live="polite">{list.length} garment{list.length === 1 ? '' : 's'}</p>
        <label className="ml-auto flex items-center gap-2 text-[13px]"><span className="text-muted hidden sm:inline">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-full border border-line bg-surface px-3 font-semibold text-[13px]" aria-label="Sort by">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
      </div>
      {pills.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 -mx-4 px-4 lg:mx-0 lg:px-0">
          {pills.map(([l, rm]) => <button key={l} onClick={rm} className="shrink-0 h-8 pl-3 pr-2 rounded-full bg-tint text-[12px] font-semibold inline-flex items-center gap-1">{l}<X size={14} aria-label={`Remove ${l}`} /></button>)}
          <button onClick={() => setF({ ...EMPTY })} className="shrink-0 h-8 px-3 text-[12px] font-semibold text-terra underline underline-offset-2">Clear all</button>
        </div>
      )}
      <div className="grid lg:grid-cols-[260px_1fr] gap-10 mt-4">
        <aside className="hidden lg:block sticky self-start max-h-[calc(100vh-150px)] overflow-y-auto pr-2" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 140px)' }} aria-label="Filters">
          <FilterPanel f={f} set={setF} products={state.products.filter((p) => !p.archived)} />
        </aside>
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 lg:gap-x-6">{Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}</div>
          ) : list.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-9 lg:gap-x-6">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <Empty icon={<SearchX size={24} />} title="Nothing matches yet" body={f.date ? 'No garments in those filters are free on that date. Try another date or size.' : 'Try removing a filter, or search for a colour, garment or occasion.'} action={<Button variant="secondary" onClick={() => setF({ ...EMPTY })}>Clear filters</Button>} />
          )}
        </div>
      </div>
      <Modal open={sheet} onClose={() => setSheet(false)} title="Filter" footer={<div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setF({ ...EMPTY })}>Clear</Button><Button className="flex-[2]" onClick={() => setSheet(false)}>Show {list.length} garments</Button></div>}>
        <FilterPanel f={f} set={setF} products={state.products.filter((p) => !p.archived)} />
      </Modal>
    </div>
  );
}
