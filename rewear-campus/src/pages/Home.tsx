import { useMemo, useState } from 'react';
import { ArrowRight, BadgeIndianRupee, MapPin, Sparkles, Recycle, Search, CalendarDays, Store, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../store/store';
import { GarmentArt } from '../components/GarmentArt';
import { ProductCard } from '../components/Product';
import { Badge, LinkButton, SectionHead, DemoNote } from '../components/ui';
import { OCCASIONS, STYLES } from '../data/catalogue';
import { fmtShort, inr, cx } from '../lib/util';
import type { ArtKind, Occasion } from '../data/types';
import { PeoplePlanetProfit } from './Sustainability';

const OCC_ART: Record<Occasion, { kind: ArtKind; c: string; a?: string; bg: string; k2?: ArtKind; c2?: string; a2?: string }> = {
  placements: { kind: 'interview-set', c: '#1f2f4d', a: '#f1f0eb', bg: '#D8E2D3', k2: 'pantsuit', c2: '#3b3e42', a2: '#f4f2ec' },
  presentations: { kind: 'blazer-w', c: '#c9b28d', a: '#f4f2ec', bg: '#EDE6D8', k2: 'blazer', c2: '#7c8186', a2: '#f4f2ec' },
  fests: { kind: 'dress', c: '#b9603f', a: '#e9c98d', bg: '#F0DFD3', k2: 'kurta-embroidered', c2: '#1d1d1f', a2: '#cfae6b' },
  'ethnic-day': { kind: 'kurta-w', c: '#c99a33', a: '#f1ead9', bg: '#EFE6CF', k2: 'kurta', c2: '#26408b', a2: '#eae6da' },
  farewell: { kind: 'saree', c: '#e7bfbd', a: '#c9a45f', bg: '#E9DCDA', k2: 'blazer', c2: '#1b1d1c', a2: '#f4f2ec' },
  weddings: { kind: 'lehenga', c: '#b72d63', a: '#d8b469', bg: '#E8D7DA', k2: 'sherwani', c2: '#e9dfc6', a2: '#b8914a' },
};

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="gutter max-w-[1440px] mx-auto grid lg:grid-cols-[1.02fr_1fr] gap-8 lg:gap-12 pt-6 lg:pt-12 pb-10 lg:pb-16 items-center">
        <div className="anim-rise">
          <p className="eyebrow text-brand mb-4 flex items-center gap-2"><span className="h-px w-8 bg-gold" />Rent. Wear. Return. Repeat.</p>
          <h1 className="font-serif font-semibold text-[48px] leading-[0.95] sm:text-[64px] lg:text-[88px] tracking-[-0.02em]">
            Big Occasions.<br /><span className="italic text-brand">Small</span> Price Tags.
          </h1>
          <p className="mt-5 text-[16px] lg:text-[18px] text-muted max-w-[46ch]">From placement interviews to festive nights, wear the perfect outfit without buying it.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <LinkButton href="#explore" size="lg">Explore Collection <ArrowRight size={18} /></LinkButton>
            <LinkButton href="#pass" size="lg" variant="secondary">Discover ReWear Pass</LinkButton>
          </div>
          <p className="mt-6 text-[13px] text-muted">Pilot for CHRIST University, Central Campus · Bengaluru</p>
        </div>
        <div className="relative">
          {/* The campus rack: three garments on a brass rail, the brand's physical pop-up in miniature. */}
          <div className="relative rounded-[24px] overflow-hidden bg-forest aspect-[5/4] lg:aspect-[6/5]">
            <div className="absolute inset-0 paper opacity-60" />
            <div className="absolute inset-x-[6%] top-[11%] h-[6px] rounded-full bg-gradient-to-b from-[#e7cf98] to-[#a98a4c] shadow" />
            <div className="absolute inset-x-[6%] top-[9%] bottom-[14%] grid grid-cols-3 gap-0">
              <GarmentArt kind="interview-set" color="#1f2f4d" accent="#f1f0eb" backdrop={false} className="w-full h-full origin-top scale-[1.32]" title="Navy interview outfit" />
              <GarmentArt kind="anarkali" color="#1d5c49" accent="#d3b06c" backdrop={false} className="w-full h-full origin-top scale-[1.32]" title="Emerald Anarkali" />
              <GarmentArt kind="kurta-embroidered" color="#efe8d8" accent="#b8914a" backdrop={false} className="w-full h-full origin-top scale-[1.32]" title="Ivory festive kurta" />
            </div>
            <div className="absolute left-4 bottom-4 right-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-ivory/95 text-forest-deep px-3 py-1.5 text-[12px] font-bold">Blazers from ₹399</span>
              <span className="rounded-full bg-ivory/95 text-forest-deep px-3 py-1.5 text-[12px] font-bold">Anarkalis from ₹599</span>
              <span className="rounded-full bg-gold text-forest-deep px-3 py-1.5 text-[12px] font-bold">Kurta sets from ₹399</span>
            </div>
          </div>
          <div className="hidden lg:flex absolute -left-8 bottom-24 bg-surface rounded-2xl shadow-lift p-4 gap-3 items-center w-[260px] border border-line">
            <span className="h-11 w-11 rounded-full bg-tint grid place-items-center text-brand"><BadgeIndianRupee size={20} /></span>
            <span className="text-[13px] leading-snug"><b className="block text-[15px]">Save {inr(2101)}</b>renting a ₹2,500 blazer for one interview</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { i: BadgeIndianRupee, t: 'Rentals from ₹299', s: 'Shirts and trousers for 48 hours' },
    { i: MapPin, t: 'Convenient campus pickup', s: 'Collect from a pop-up rack' },
    { i: Sparkles, t: 'Professionally cleaned', s: 'Cleaned and checked every cycle' },
    { i: Recycle, t: 'Sustainable fashion', s: 'One garment, many occasions' },
  ];
  return (
    <section className="gutter max-w-[1440px] mx-auto">
      <ul className="grid grid-cols-2 lg:grid-cols-4 border-y border-line">
        {items.map(({ i: I, t, s }, k) => (
          <li key={t} className={cx('flex items-start gap-3 py-5 lg:py-6 px-2 lg:px-6', k % 2 === 1 && 'border-l border-line', k >= 2 && 'border-t lg:border-t-0 border-line', k === 2 && 'lg:border-l')}>
            <I size={22} className="text-brand shrink-0 mt-0.5" strokeWidth={1.7} />
            <span><b className="block text-[14px] leading-tight">{t}</b><span className="text-[12px] text-muted">{s}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Occasions() {
  return (
    <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
      <SectionHead eyebrow="Shop by occasion" title={<>Dressed for the <span className="italic">moment</span></>} action={<a href="#explore" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand">View all <ArrowRight size={15} /></a>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        {OCCASIONS.map((o, i) => {
          const a = OCC_ART[o.id];
          return (
            <a key={o.id} href={`#occasion-${o.id}`} className={cx('group relative rounded-2xl overflow-hidden flex flex-col justify-end', i === 0 ? 'col-span-2 lg:col-span-1 aspect-[16/11] lg:aspect-[4/3]' : 'aspect-[4/5] lg:aspect-[4/3]')} style={{ background: a.bg }}>
              <div className="absolute inset-0 flex items-end justify-center gap-0 pt-4 transition duration-500 group-hover:scale-[1.04]">
                {a.k2 && <GarmentArt kind={a.k2} color={a.c2!} accent={a.a2} backdrop={false} className="h-[86%] w-auto -mr-[12%] opacity-95" />}
                <GarmentArt kind={a.kind} color={a.c} accent={a.a} backdrop={false} className="h-[92%] w-auto" />
              </div>
              <div className="relative p-4 lg:p-5 bg-gradient-to-t from-[#0f1b15]/80 via-[#0f1b15]/35 to-transparent text-ivory">
                <h3 className="font-serif text-[22px] lg:text-[28px] font-semibold leading-tight">{o.label}</h3>
                <p className="text-[12.5px] text-ivory/80 hidden sm:block">{o.blurb}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function Styles() {
  const art: Record<string, [ArtKind, string, string?]> = { 'men-formal': ['suit', '#3a3d40', '#f4f2ec'], 'women-formal': ['pantsuit', '#22304d', '#f4f2ec'], 'men-ethnic': ['ethnic-set-m', '#efe8d8', '#6e2330'], 'women-ethnic': ['saree', '#6e1f2e', '#d1ad62'], sets: ['corporate-set', '#1f2a44', '#f2f1ec'] };
  return (
    <section className="mt-16 lg:mt-24">
      <div className="gutter max-w-[1440px] mx-auto"><SectionHead eyebrow="Shop by style" title="Find your fit, formal or festive" /></div>
      <div className="gutter max-w-[1440px] mx-auto">
        <div className="flex lg:grid lg:grid-cols-5 gap-3 lg:gap-4 overflow-x-auto no-scrollbar snap-x-m -mx-4 px-4 lg:mx-0 lg:px-0">
          {STYLES.map((s) => {
            const [k, c, a] = art[s.id];
            return (
              <a key={s.id} href={`#style-${s.id}`} className="snap-start-m shrink-0 w-[42vw] sm:w-[30vw] lg:w-auto group">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-tint"><GarmentArt kind={k} color={c} accent={a} seed={s.id} className="w-full h-full transition duration-500 group-hover:scale-[1.04]" /></div>
                <p className="mt-2.5 font-semibold text-[14px] flex items-center justify-between">{s.label}<ArrowRight size={15} className="text-muted group-hover:text-brand group-hover:translate-x-0.5 transition" /></p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Trending() {
  const { state } = useStore();
  const items = useMemo(() => state.products.filter((p) => !p.archived).sort((a, b) => b.popularity - a.popularity).slice(0, 8), [state.products]);
  return (
    <section className="mt-16 lg:mt-24">
      <div className="gutter max-w-[1440px] mx-auto"><SectionHead eyebrow="Trending on campus" title="The most-booked pieces this term" action={<a href="#explore" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">Shop all <ArrowRight size={15} /></a>} /></div>
      <div className="gutter max-w-[1440px] mx-auto">
        <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto no-scrollbar snap-x-m -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
          {items.map((p) => <ProductCard key={p.id} p={p} className="snap-start-m shrink-0 w-[62vw] sm:w-[38vw] lg:w-auto" />)}
        </div>
        <DemoNote className="mt-4">“Trending” ranks the pilot catalogue by the founding team's expected demand, not by verified sales.</DemoNote>
      </div>
    </section>
  );
}

function ThreeWays() {
  const ways = [
    { name: 'ReWear Rentals', line: 'Rent individual outfits whenever you need them.', href: '#explore', cta: 'Browse rentals', tone: 'bg-surface border border-line', icon: <GarmentArt kind="blazer" color="#1f2f4d" accent="#f4f2ec" backdrop={false} className="h-36 w-auto" /> },
    { name: 'ReWear Pass', line: 'Access affordable fashion through monthly memberships.', href: '#pass', cta: 'Compare plans', tone: 'bg-forest text-ivory', icon: <div className="h-36 grid place-items-center"><div className="w-44 h-28 rounded-xl bg-gradient-to-br from-[#e6cf99] to-[#b8975a] text-forest-deep p-3 flex flex-col justify-between shadow-lift rotate-[-5deg]"><span className="text-[10px] font-bold tracking-[0.3em]">REWEAR PASS</span><span className="font-serif text-xl font-semibold">Campus Plus</span><span className="text-[10px] font-bold">2 CREDITS · MONTHLY</span></div></div> },
    { name: 'ReWear Pop-Up', line: 'Discover, try and collect outfits at campus racks.', href: '#popups', cta: 'See pop-ups', tone: 'bg-[#EFE3D7] text-ink', icon: <div className="h-36 flex items-end justify-center"><div className="relative w-48 h-32"><div className="absolute inset-x-0 top-2 h-1.5 rounded bg-[#a98a4c]" /><div className="absolute left-1 top-2 bottom-0 w-1 bg-[#a98a4c]" /><div className="absolute right-1 top-2 bottom-0 w-1 bg-[#a98a4c]" /><div className="absolute inset-x-3 top-0 bottom-2 grid grid-cols-4">{(['kurta', 'saree', 'blazer', 'dress'] as ArtKind[]).map((k, i) => <GarmentArt key={k} kind={k} color={['#efe8d8', '#6e1f2e', '#22304d', '#b9603f'][i]} accent={['#e9e3d4', '#d1ad62', '#f4f2ec', '#e9c98d'][i]} backdrop={false} className="h-full w-auto" />)}</div></div></div> },
  ];
  return (
    <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
      <SectionHead eyebrow="Three ways to ReWear" title={<>One wardrobe, <span className="italic">shared</span> by campus</>} />
      <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
        {ways.map((w) => (
          <a key={w.name} href={w.href} className={cx('group rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition', w.tone)}>
            {w.icon}
            <div><h3 className="font-serif text-[28px] font-semibold">{w.name}</h3><p className="opacity-75 text-[14px] mt-1">{w.line}</p></div>
            <span className="mt-auto inline-flex items-center gap-1.5 font-semibold text-[14px]">{w.cta}<ArrowRight size={16} className="group-hover:translate-x-1 transition" /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

const CALC_ITEMS = [
  { id: 'blazer', label: 'Blazer', buy: 2500, rent: 399 },
  { id: 'suit', label: 'Business suit', buy: 7500, rent: 699 },
  { id: 'shirt', label: 'Formal shirt', buy: 1500, rent: 299 },
  { id: 'kurta', label: 'Kurta set', buy: 2400, rent: 399 },
  { id: 'saree', label: 'Festive saree', buy: 4500, rent: 499 },
  { id: 'lehenga', label: 'Festive lehenga', buy: 14000, rent: 699 },
];

export function Calculator() {
  const [item, setItem] = useState(CALC_ITEMS[0]);
  const [n, setN] = useState(1);
  const rentTotal = item.rent * n;
  const saving = item.buy - rentTotal;
  const breakEven = Math.ceil(item.buy / item.rent);
  return (
    <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
      <div className="rounded-[24px] bg-tint p-5 sm:p-8 lg:p-12 grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <p className="eyebrow text-brand mb-2">Rent vs buy</p>
          <h2 className="font-serif text-[32px] lg:text-[44px] font-semibold leading-[1.05]">Do the maths before you buy</h2>
          <p className="text-muted mt-3 max-w-[48ch] text-[15px]">Pick a garment and how many occasions you need it for. Buying prices are estimated retail; rental prices are proposed pilot prices.</p>
          <fieldset className="mt-6">
            <legend className="text-[13px] font-semibold mb-2">Garment</legend>
            <div className="flex flex-wrap gap-2">
              {CALC_ITEMS.map((c) => <button key={c.id} type="button" aria-pressed={c.id === item.id} onClick={() => setItem(c)} className={cx('h-10 px-4 rounded-full text-[13px] font-semibold border transition', c.id === item.id ? 'bg-brand text-onbrand border-brand' : 'bg-surface border-line hover:border-fg/40')}>{c.label}</button>)}
            </div>
          </fieldset>
          <div className="mt-6">
            <label htmlFor="calc-n" className="text-[13px] font-semibold flex justify-between"><span>Occasions this year</span><span className="tnum">{n}</span></label>
            <input id="calc-n" type="range" min={1} max={12} value={n} onChange={(e) => setN(+e.target.value)} className="w-full mt-3 accent-[#164B35]" />
            <div className="flex justify-between text-[11px] text-muted tnum"><span>1</span><span>12</span></div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-6 lg:p-8 flex flex-col">
          <dl className="space-y-3 text-[15px] tnum">
            <div className="flex justify-between"><dt className="text-muted">Buying a {item.label.toLowerCase()}</dt><dd className="font-semibold">{inr(item.buy)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Renting {n} × {inr(item.rent)}</dt><dd className="font-semibold">{inr(rentTotal)}</dd></div>
          </dl>
          <div className="border-t border-line my-5" />
          {saving > 0 ? (
            <>
              <p className="text-[13px] font-semibold text-muted">Potential saving</p>
              <p className="font-serif text-[56px] lg:text-[68px] font-semibold leading-none text-brand tnum">{inr(saving)}</p>
              <p className="text-[13px] text-muted mt-2">{Math.round((saving / item.buy) * 100)}% less than buying. Renting stays cheaper up to {breakEven - 1} occasion{breakEven - 1 === 1 ? '' : 's'}.</p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-muted">Buying is cheaper here</p>
              <p className="font-serif text-[44px] font-semibold leading-none text-terra tnum">{inr(-saving)} more to rent</p>
              <p className="text-[13px] text-muted mt-2">At {n} occasions, owning costs less. Consider buying, or use ReWear Pass credits to bring the cost down.</p>
            </>
          )}
          <p className="text-[12px] text-muted mt-auto pt-6">Excludes the refundable deposit, which is returned after the garment is checked. Retail figures are estimates.</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { i: Search, t: 'Discover your outfit', s: 'Browse by occasion, or let Find My Fit shortlist pieces in your size and budget.' },
    { i: CalendarDays, t: 'Choose your size and dates', s: 'Pick 48 or 72 hours. The calendar only offers dates a garment is free.' },
    { i: Store, t: 'Collect from a campus rack', s: 'Show your digital pickup pass at your chosen pop-up rack and time slot.' },
    { i: RotateCcw, t: 'Wear, return and repeat', s: 'Drop it back on the rack. We clean and check it, then refund your deposit.' },
  ];
  return (
    <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
      <SectionHead eyebrow="How it works" title="Four steps from rack to occasion" />
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
        {steps.map(({ i: I, t, s }, k) => (
          <li key={t} className="relative lg:pr-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-12 w-12 rounded-full bg-brand text-onbrand grid place-items-center shrink-0"><I size={21} /></span>
              {k < 3 && <span className="hidden lg:block flex-1 h-px border-t border-dashed border-fg/25" />}
            </div>
            <p className="text-[12px] font-bold text-gold tnum">STEP {k + 1}</p>
            <h3 className="font-serif text-[24px] font-semibold leading-tight mt-1">{t}</h3>
            <p className="text-muted text-[14px] mt-1.5">{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function UpcomingPopups() {
  const { state } = useStore();
  const events = state.events.slice(0, 3);
  return (
    <section className="mt-16 lg:mt-24 bg-forest text-ivory">
      <div className="gutter max-w-[1440px] mx-auto py-14 lg:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div><p className="eyebrow text-gold mb-2">ReWear Pop-Up</p><h2 className="font-serif text-[32px] lg:text-[48px] font-semibold leading-[1.02]">Try it on. <span className="italic">On campus.</span></h2></div>
          <a href="#popups" className="hidden sm:inline-flex items-center gap-1 font-semibold text-gold">All pop-ups <ArrowRight size={15} /></a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {events.map((e) => {
            const booked = state.appointments.filter((a) => a.eventId === e.id && a.status !== 'cancelled').length;
            const cap = e.slots.reduce((a, s) => a + s.capacity, 0);
            return (
              <a key={e.id} href={`#popup-${e.id}`} className="rounded-2xl bg-forest-deep/60 border border-ivory/10 p-5 hover:border-gold/60 transition flex flex-col">
                <p className="text-gold font-bold text-[13px] tnum">{fmtShort(e.date)} · {e.start}</p>
                <h3 className="font-serif text-[26px] font-semibold mt-1 leading-tight">{e.name}</h3>
                <p className="text-ivory/70 text-[14px] mt-1">{e.theme}</p>
                <p className="text-ivory/60 text-[12px] mt-3 flex items-center gap-1.5"><MapPin size={13} />{e.location}</p>
                <div className="mt-5 flex items-center justify-between"><span className="text-[12px] text-ivory/70 tnum">{cap - booked} fitting slots left</span><span className="inline-flex h-9 items-center px-4 rounded-full bg-gold text-forest-deep text-[13px] font-bold">Reserve</span></div>
              </a>
            );
          })}
        </div>
        <p className="mt-5 text-[12px] text-ivory/60">Demonstration events. Locations and schedules are illustrative until approved and confirmed with the campus.</p>
      </div>
    </section>
  );
}

function PassPreview() {
  const { state } = useStore();
  return (
    <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
      <SectionHead eyebrow="ReWear Pass" title={<>A membership for the <span className="italic">busy</span> semester</>} sub="Monthly rental credits for students with more than one occasion a month. Proposed pilot prices, subject to customer validation." action={<a href="#pass" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand">Compare <ArrowRight size={15} /></a>} />
      <div className="grid md:grid-cols-3 gap-4">
        {state.policies.plans.map((p) => (
          <div key={p.id} className={cx('rounded-2xl p-6 border flex flex-col', p.id === 'plus' ? 'bg-forest text-ivory border-forest' : 'bg-surface border-line')}>
            <div className="flex items-center justify-between"><h3 className="font-serif text-[26px] font-semibold">{p.name}</h3>{p.id === 'plus' && <Badge tone="gold">Recommended</Badge>}</div>
            <p className="mt-2"><span className="font-serif text-[44px] font-semibold tnum">{inr(p.price)}</span><span className="opacity-70 text-sm"> / month</span></p>
            <ul className="mt-4 space-y-2 text-[14px]">{p.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} className={cx('shrink-0 mt-0.5', p.id === 'plus' ? 'text-gold' : 'text-brand')} />{f}</li>)}</ul>
            <LinkButton href="#pass" variant={p.id === 'plus' ? 'gold' : 'secondary'} className="mt-6">Choose {p.name.replace('Campus ', '')}</LinkButton>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  ['How does renting work?', 'Choose a garment, size and a 48 or 72-hour window. Pay the rental fee and a refundable deposit, then collect from your chosen campus rack at your pickup slot. Return it to the rack by the deadline on your pickup pass.'],
  ['How are clothes cleaned?', 'Every garment is professionally dry-cleaned or steam-sanitised between rentals and checked for stains, loose buttons and seams before it goes back on the rack. Moving to eco-friendly dry-cleaning partners is a planned commitment for the pilot.'],
  ['What happens if an outfit does not fit?', 'Try it on at the rack when you collect. If it does not fit, swap to another available size on the spot, or cancel that item for a full refund of the fee and deposit.'],
  ['Where do I collect my outfit?', 'From a ReWear pop-up rack on campus. Rack locations shown in this prototype are proposals until they are approved and confirmed.'],
  ['Is the security deposit refundable?', 'Yes. The deposit is held separately from the rental fee and refunded after the quality check. Deductions apply only for recorded damage beyond normal wear, and they are itemised.'],
  ['How do subscriptions work?', 'ReWear Pass gives you a fixed number of rental credits each 30-day cycle. One credit covers one eligible 48-hour rental. Credits do not roll over and there are no unlimited plans.'],
  ['What happens if clothing is damaged?', 'Tell us at return. Minor wear is on us. Repairable damage is charged at repair cost, deducted from the deposit and never more than the deposit held.'],
];

export function FAQ({ items = FAQS }: { items?: string[][] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map(([q, a], i) => (
        <div key={q}>
          <h3>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold text-[16px]">
              {q}<ChevronDown size={20} className={cx('shrink-0 transition', open === i && 'rotate-180')} />
            </button>
          </h3>
          {open === i && <p className="pb-5 -mt-1 text-muted text-[15px] max-w-[70ch] anim-fade">{a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Trust />
      <Occasions />
      <Styles />
      <Trending />
      <ThreeWays />
      <Calculator />
      <HowItWorks />
      <UpcomingPopups />
      <PassPreview />
      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="eyebrow text-brand mb-2">Good for you. Better for the planet.</p>
          <h2 className="font-serif text-[32px] lg:text-[48px] font-semibold leading-[1.02]">People, planet and profit in one rack</h2>
          <p className="text-muted mt-4 max-w-[52ch]">Renting lets one garment serve many occasions. ReWear is built around SDG 12, Responsible Consumption and Production: affordable for students, longer life for clothes, and a business that can pay for its own cleaning and repairs.</p>
          <LinkButton href="#sustainability" variant="secondary" className="mt-6">Our sustainability approach <ArrowRight size={16} /></LinkButton>
        </div>
        <PeoplePlanetProfit compact />
      </section>
      <section className="gutter max-w-[1100px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="Questions" title="Frequently asked" />
        <FAQ />
      </section>
    </>
  );
}
