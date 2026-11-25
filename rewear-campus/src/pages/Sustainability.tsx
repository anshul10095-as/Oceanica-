import { useState } from 'react';
import { Droplets, Scissors, Hourglass, ShieldCheck, Recycle, Info } from 'lucide-react';
import { useStore } from '../store/store';
import { metrics } from '../store/rules';
import { cx, inr } from '../lib/util';
import { SectionHead, Stat } from '../components/ui';

const CIRCLES = {
  people: { label: 'People', color: '#C97654', points: ['Affordable fashion', 'Accessible clothing', 'Inclusive fashion', 'Student convenience'] },
  planet: { label: 'Planet', color: '#164B35', points: ['Longer clothing life', 'Increased garment reuse', 'Reduced textile waste potential', 'Responsible garment maintenance'] },
  profit: { label: 'Profit', color: '#B08A3E', points: ['Revenue from rentals', 'Revenue from subscriptions', 'Financially sustainable business operations'] },
} as const;
type Key = keyof typeof CIRCLES;

/** Interactive three-circle Venn, after the People–Planet–Profit diagram on the founding poster. */
export function PeoplePlanetProfit({ compact }: { compact?: boolean }) {
  const [sel, setSel] = useState<Key | null>(compact ? null : 'people');
  const pos: Record<Key, [number, number]> = { people: [200, 140], planet: [140, 245], profit: [260, 245] };
  return (
    <div className={cx('grid gap-6 items-center', !compact && 'lg:grid-cols-[1fr_1fr]')}>
      <svg viewBox="0 0 400 380" className="w-full max-w-[460px] mx-auto" role="group" aria-label="People, Planet, Profit diagram">
        {(Object.keys(CIRCLES) as Key[]).map((k) => {
          const [cx_, cy] = pos[k]; const c = CIRCLES[k]; const on = sel === k;
          return (
            <g key={k} role="button" tabIndex={0} aria-pressed={on} aria-label={c.label} onClick={() => setSel(on && compact ? null : k)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(k))} className="cursor-pointer outline-none">
              <circle cx={cx_} cy={cy} r={on ? 112 : 106} fill={c.color} fillOpacity={on ? 0.32 : 0.16} stroke={c.color} strokeWidth={on ? 3 : 1.6} style={{ transition: 'all .25s' }} />
              <text x={k === 'people' ? cx_ : k === 'planet' ? cx_ - 34 : cx_ + 34} y={k === 'people' ? cy - 46 : cy + 30} textAnchor="middle" className="font-serif" fontSize="26" fontWeight="600" fill="rgb(var(--fg))">{c.label}</text>
            </g>
          );
        })}
        <text x="200" y="214" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="2" fill="rgb(var(--fg))">REWEAR</text>
        <text x="200" y="228" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1.5" fill="rgb(var(--muted))">SDG 12</text>
      </svg>
      {!compact ? (
        <div aria-live="polite">
          {sel ? (
            <div className="anim-fade">
              <p className="eyebrow" style={{ color: CIRCLES[sel].color }}>{CIRCLES[sel].label}</p>
              <ul className="mt-3 space-y-3">{CIRCLES[sel].points.map((pt) => <li key={pt} className="flex gap-3 items-start text-[17px]"><span className="mt-2 h-2 w-2 rounded-full shrink-0" style={{ background: CIRCLES[sel].color }} />{pt}</li>)}</ul>
            </div>
          ) : null}
          <p className="text-[13px] text-muted mt-5">Select a circle to see what it covers. The overlap is the business: a model that only works if it is affordable, extends garment life and covers its own costs.</p>
        </div>
      ) : sel ? <p className="text-center text-[14px] text-muted -mt-2">{CIRCLES[sel].points.join(' · ')}</p> : <p className="text-center text-[13px] text-muted -mt-2">Tap a circle</p>}
    </div>
  );
}

export default function Sustainability() {
  const { state } = useStore();
  const [demo, setDemo] = useState(true);
  const m = metrics(state, demo);
  return (
    <div>
      <section className="bg-forest text-ivory">
        <div className="gutter max-w-[1440px] mx-auto py-14 lg:py-24 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div>
            <p className="eyebrow text-gold mb-3">Sustainability</p>
            <h1 className="font-serif text-[48px] lg:text-[84px] font-semibold leading-[0.92]">Good for You.<br /><span className="italic text-sage">Better</span> for the Planet.</h1>
          </div>
          <p className="text-ivory/75 text-[16px] max-w-[48ch]">A blazer bought for one interview spends most of its life in a cupboard. A shared blazer on a campus rack can serve many students. That is the whole idea, and we report only what this platform can actually count.</p>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16">
        <SectionHead eyebrow="Our framework" title="People, Planet, Profit" sub="Taken from the founding team's poster. Each circle is a commitment; the overlap is where ReWear Campus has to operate." />
        <PeoplePlanetProfit />
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24 grid lg:grid-cols-[360px_1fr] gap-8 items-stretch">
        <div className="rounded-[22px] bg-[#BF8B2E] text-white p-7 flex flex-col">
          <p className="font-bold text-[13px] tracking-[0.2em]">SUSTAINABLE DEVELOPMENT GOAL</p>
          <p className="font-serif text-[120px] leading-none font-semibold mt-2">12</p>
          <p className="font-serif text-[30px] leading-tight font-semibold">Responsible Consumption and Production</p>
          <Recycle size={56} strokeWidth={1.4} className="mt-auto opacity-90" />
        </div>
        <div className="rounded-[22px] border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-serif text-[30px] lg:text-[40px] font-semibold leading-tight">Reuse before purchase</h2>
          <div className="mt-4 space-y-4 text-[15.5px] text-muted max-w-[68ch]">
            <p>SDG 12 asks for consumption patterns that use fewer resources per unit of benefit. Occasion wear is an obvious case: students need formal and ethnic outfits for a handful of days a year, and most of the clothes bought for those days are worn once or twice.</p>
            <p>Renting changes the unit economics of an outfit. Each garment on the rack is cleaned, checked and worn again by the next student, so the same garment covers many occasions instead of one purchase per occasion. Whether this reduces purchases overall is something the pilot needs to measure, not assume.</p>
          </div>
          <div className="mt-6 rounded-xl bg-tint p-4 text-[13px] flex gap-3"><Info size={18} className="text-brand shrink-0" /><p>The founding poster cites India generating about 7.07 million tonnes of textile waste a year (source-reported figure: Ministry of Textiles 2026, as cited by CEEW). We use it as context only, not as a measure of ReWear's impact.</p></div>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="Improvement actions" title="How we will look after the garments" sub="Planned operational commitments for the pilot. None of these is independently verified yet." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: Droplets, t: 'Eco-friendly dry cleaning', s: 'Prioritise cleaners using lower-impact solvents and wet-cleaning where fabric allows. Planned; partner not yet selected.' },
            { i: Scissors, t: 'Garment repair services', s: 'Fix loose buttons, seams and hems after every return so a garment stays on the rack instead of being retired.' },
            { i: Hourglass, t: 'Extending garment usability', s: 'Track rental cycles for each unit and retire garments only when they cannot be repaired to rental condition.' },
            { i: ShieldCheck, t: 'Responsible clothing maintenance', s: 'Steam rather than dry-clean shirts and cotton kurtas where hygiene allows, and store garments in breathable covers.' },
          ].map(({ i: I, t, s }) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-5"><span className="h-11 w-11 rounded-full bg-terra/15 text-terra grid place-items-center"><I size={20} /></span><h3 className="font-serif text-[22px] font-semibold mt-4 leading-tight">{t}</h3><p className="text-[14px] text-muted mt-2">{s}</p><p className="text-[11px] font-bold tracking-[0.12em] text-terra mt-3">PLANNED COMMITMENT</p></div>
          ))}
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="Your ReWear impact" title="Counted from transactions, not estimated" sub="These figures are calculated from the bookings, returns, cleaning and repair records in this app. They update when you complete a rental." />
        <div className="flex flex-wrap gap-2 mb-5" role="radiogroup" aria-label="Data shown">
          <button role="radio" aria-checked={demo} onClick={() => setDemo(true)} className={cx('h-10 px-4 rounded-full border text-[13px] font-semibold', demo ? 'bg-brand text-onbrand border-brand' : 'border-line')}>All records (includes seeded demo data)</button>
          <button role="radio" aria-checked={!demo} onClick={() => setDemo(false)} className={cx('h-10 px-4 rounded-full border text-[13px] font-semibold', !demo ? 'bg-brand text-onbrand border-brand' : 'border-line')}>Only transactions made in this demo session</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Stat label="Completed rentals" value={m.completedRentals} sub="garment rentals returned" />
          <Stat label="Garments reused" value={m.garmentsReused} sub="units worn by two or more renters" />
          <Stat label="Estimated customer savings" value={inr(m.estimatedSavings)} sub="estimated retail minus rental paid" />
          <Stat label="Garments cleaned" value={m.garmentsCleaned} sub="completed cleaning records" />
          <Stat label="Garments repaired" value={m.garmentsRepaired} sub="completed repair records" />
          <Stat label="Rental frequency" value={m.avgCycles.toFixed(2)} sub={`average rentals per garment unit (${m.totalCycles} total)`} />
        </div>
        <p className="text-[12px] text-muted mt-4">We do not report carbon or water savings, certifications or “purchases avoided”: none of these can be verified from rental data alone. Savings compare against estimated retail prices.</p>
      </section>
    </div>
  );
}
