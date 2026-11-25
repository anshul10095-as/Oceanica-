import { useState } from 'react';
import { Shirt, Wallet, Trash2, TrendingDown, Rocket, Users, Cog, BarChart3, ArrowRight, Plus, Check } from 'lucide-react';
import { SectionHead, DemoNote, LinkButton } from '../components/ui';
import { cx } from '../lib/util';

const SCORE = [
  { c: 'Market Need', w: 30, r: 5, s: '1.50' },
  { c: 'Market Size', w: 25, r: 4, s: '1.00' },
  { c: 'Competition', w: 25, r: 4, s: '1.00' },
  { c: 'Team Fit', w: 20, r: 5, s: '1.00' },
];

const PESTLE = [
  { k: 'P', t: 'Political', pts: ['Support for circular economy', 'Textile recycling initiatives'], trend: 'We expect this support to strengthen over the next 3–5 years.', rating: 'Opportunity · High', c: '#164B35' },
  { k: 'E', t: 'Economic', pts: ['Rising cost of formal and ethnic wear', 'Increased appeal of affordable rental models'], trend: 'We expect prices to keep rising, roughly 5–7% a year in our assumption.', rating: 'Opportunity · High', c: '#B08A3E' },
  { k: 'S', t: 'Social', pts: ['Sustainability awareness', 'Growing acceptance of rental culture'], trend: 'We expect re-use to become more acceptable among students.', rating: 'Opportunity · High', c: '#C97654' },
  { k: 'T', t: 'Technological', pts: ['Digital booking', 'Size matching', 'Inventory management'], trend: 'We expect more affordable, accessible tools for small rental operators.', rating: 'Opportunity · Medium', c: '#3E5C76' },
  { k: 'L', t: 'Legal', pts: ['Consumer rights', 'Hygiene considerations', 'Rental agreements'], trend: 'We expect clearer guidelines for rental platforms.', rating: 'Opportunity / Threat · Medium', c: '#6B5B7B' },
  { k: 'E', t: 'Environmental', pts: ['Textile waste', 'Resource consumption', 'Circular fashion'], trend: 'We expect growing pressure for circular fashion.', rating: 'Opportunity · High', c: '#5E7A5B' },
];

const TEAM = [
  { n: 'Anshul Shekhar', id: '2520211' },
  { n: 'Aadil V. Thampi', id: '2520202' },
  { n: 'Abhinav Nambiar', id: '2520206' },
  { n: 'Dasarath Singh', id: '2520227' },
];

export default function Story() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <section className="gutter max-w-[1440px] mx-auto pt-10 lg:pt-16 pb-6">
        <p className="eyebrow text-brand mb-3">Our Story</p>
        <h1 className="font-serif text-[46px] lg:text-[84px] font-semibold leading-[0.93] max-w-[16ch]">How can we make students buy less and <span className="italic text-brand">reuse more?</span></h1>
        <p className="text-muted text-[17px] mt-6 max-w-[60ch]">ReWear Campus started as an entrepreneurship project by four students. This page sets out how we got from a problem we kept seeing on campus to a decision to pilot.</p>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-10">
        <SectionHead eyebrow="1 · The problem and evidence" title="Expensive outfits, worn once" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: Shirt, t: 'One or two wears', s: 'Students buy blazers, suits and ethnic sets for an interview, a fest or a farewell, then rarely wear them again.' },
            { i: Wallet, t: 'Budget pressure', s: 'A blazer or a festive outfit can cost more than a month of a student\'s discretionary spending, often at short notice.' },
            { i: Trash2, t: 'Textile waste', s: 'The poster cites ~7.07 Mt of textile waste a year in India (source-reported: Ministry of Textiles 2026, cited by CEEW). It points to the need for circular models.' },
            { i: TrendingDown, t: 'Operations matter', s: 'Flyrobe, an early leader in fashion rental, struggled and was acquired by Rent It Bae in 2019 (as stated on our poster). Execution and cost control decide survival.' },
          ].map(({ i: I, t, s }) => <div key={t} className="rounded-2xl border border-line bg-surface p-5"><I size={22} className="text-terra" /><h3 className="font-serif text-[22px] font-semibold mt-3">{t}</h3><p className="text-[14px] text-muted mt-1.5">{s}</p></div>)}
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <SectionHead eyebrow="2 · Idea generation" title="Brainstorming, then reversing it" sub="We listed every way students could get occasion wear without buying it, then asked the reverse question: what makes students buy more and reuse less? Each answer pointed to a fix." />
          <div className="rounded-2xl bg-tint p-5">
            <p className="eyebrow text-muted">Selected idea</p>
            <p className="font-serif text-[26px] font-semibold mt-1">A campus-based rental service for formal and ethnic wear.</p>
          </div>
        </div>
        <svg viewBox="0 0 420 340" className="w-full max-w-[520px] mx-auto" role="img" aria-label="Brainstorm diagram: campus wear solutions connected to rentals, subscriptions, pop-up racks and reverse brainstorming">
          {[[90, 70, 'Rentals', '#C97654'], [330, 70, 'Subscriptions', '#3E5C76'], [340, 250, 'Pop-up racks', '#B08A3E'], [80, 260, 'Reverse brainstorm', '#164B35']].map(([x, y, l, c]) => (
            <g key={l as string}>
              <line x1="210" y1="165" x2={x as number} y2={y as number} stroke="rgb(var(--muted))" strokeDasharray="4 5" strokeWidth="1.5" />
              <ellipse cx={x as number} cy={y as number} rx="72" ry="34" fill={c as string} fillOpacity="0.14" stroke={c as string} strokeWidth="1.6" />
              <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="rgb(var(--fg))">{l}</text>
            </g>
          ))}
          <ellipse cx="210" cy="165" rx="86" ry="46" fill="#164B35" />
          <text x="210" y="160" textAnchor="middle" fontSize="16" fontWeight="700" fill="#FAF8F2">Campus wear</text>
          <text x="210" y="181" textAnchor="middle" fontSize="16" fontWeight="700" fill="#FAF8F2">solutions</text>
        </svg>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        <div>
          <SectionHead eyebrow="3 · Opportunity evaluation" title="Weighted scorecard" />
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-[15px] bg-surface tnum">
              <thead><tr className="border-b border-line text-left"><th className="p-4">Criteria</th><th className="p-4">Weight</th><th className="p-4">Rating (1–5)</th><th className="p-4 text-right">Weighted score</th></tr></thead>
              <tbody>
                {SCORE.map((r) => <tr key={r.c} className="border-b border-line"><td className="p-4 font-semibold">{r.c}</td><td className="p-4">{r.w}%</td><td className="p-4"><span className="inline-flex gap-1" aria-label={`${r.r} of 5`}>{[1, 2, 3, 4, 5].map((i) => <span key={i} className={cx('h-2.5 w-5 rounded-full', i <= r.r ? 'bg-brand' : 'bg-line')} />)}</span> <span className="ml-2">{r.r}</span></td><td className="p-4 text-right font-semibold">{r.s}</td></tr>)}
                <tr className="bg-tint"><td className="p-4 font-serif text-[22px] font-semibold" colSpan={3}>Overall score</td><td className="p-4 text-right font-serif text-[28px] font-semibold">4.5/5</td></tr>
              </tbody>
            </table>
          </div>
          <DemoNote className="mt-3">The founding team's initial assessment, not verified customer research. The weighted scores sum to 4.50.</DemoNote>
        </div>
        <div>
          <SectionHead eyebrow="Entrepreneurial lens" title="What kind of venture this is" />
          <ul className="divide-y divide-line border-y border-line">
            {[
              { i: Rocket, t: 'Type of innovation', s: 'Service innovation and business model innovation' },
              { i: Users, t: 'Type of entrepreneurship', s: 'Commercial entrepreneurship with a sustainability focus' },
              { i: Cog, t: 'Key competencies', s: 'Opportunity recognition, resource leveraging, customer orientation' },
              { i: BarChart3, t: 'Influencing factors', s: 'Changing fashion behaviour, cost sensitivity, campus events' },
            ].map(({ i: I, t, s }) => <li key={t} className="flex gap-4 py-4"><span className="h-11 w-11 rounded-full bg-tint text-brand grid place-items-center shrink-0"><I size={19} /></span><span><b className="block">{t}</b><span className="text-muted text-[14px]">{s}</span></span></li>)}
          </ul>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="4 · PESTLE analysis" title="The external environment" sub="Trends are the team's expectations, not confirmed forecasts. Select a card for detail." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PESTLE.map((p, i) => (
            <button key={p.t} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className={cx('text-left rounded-2xl p-5 border transition', open === i ? 'text-white border-transparent' : 'bg-surface border-line hover:border-fg/30')} style={open === i ? { background: p.c } : undefined}>
              <div className="flex items-start justify-between"><span className="font-serif text-[64px] leading-none font-semibold" style={{ color: open === i ? '#fff' : p.c }}>{p.k}</span><span className={cx('h-9 w-9 rounded-full grid place-items-center', open === i ? 'bg-white/20' : 'bg-tint')}>{open === i ? <Check size={16} /> : <Plus size={16} />}</span></div>
              <h3 className="font-serif text-[26px] font-semibold mt-1">{p.t}</h3>
              <ul className="mt-2 space-y-1 text-[14px]">{p.pts.map((x) => <li key={x} className={open === i ? 'text-white/90' : 'text-muted'}>— {x}</li>)}</ul>
              {open === i && <p className="mt-3 text-[13px] text-white/85 anim-fade">{p.trend}</p>}
              <p className={cx('mt-4 text-[11px] font-bold tracking-[0.14em]', open === i ? 'text-white/80' : 'text-muted')}>{p.rating.toUpperCase()}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="5 · Interlinkages" title="How the forces combine" />
        <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-4">
          <div className="flex-1 rounded-2xl p-6 bg-[#C97654]/15 border border-[#C97654]/40"><p className="eyebrow text-terra">Social</p><p className="font-serif text-[26px] font-semibold mt-1">Sustainability awareness</p></div>
          <div className="grid place-items-center font-serif text-[40px] text-muted"><Plus size={28} /></div>
          <div className="flex-1 rounded-2xl p-6 bg-[#3E5C76]/15 border border-[#3E5C76]/40"><p className="eyebrow" style={{ color: '#3E5C76' }}>Technological</p><p className="font-serif text-[26px] font-semibold mt-1">Affordable rental platforms</p></div>
          <div className="grid place-items-center text-muted"><ArrowRight size={28} className="rotate-90 lg:rotate-0" /></div>
          <div className="flex-1 rounded-2xl p-6 bg-gold/25 border border-gold/60"><p className="eyebrow text-[#8a6a2e] dark:text-gold">Economic</p><p className="font-serif text-[26px] font-semibold mt-1">Demand and viability of the rental model</p></div>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <div className="rounded-[24px] bg-forest text-ivory p-7 lg:p-12 grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-center">
          <div className="h-40 w-40 lg:h-52 lg:w-52 rounded-full border-4 border-sage grid place-items-center mx-auto"><span className="font-serif text-[64px] lg:text-[84px] font-semibold text-sage">GO</span></div>
          <div>
            <p className="eyebrow text-gold">6 · Final decision</p>
            <h2 className="font-serif text-[36px] lg:text-[52px] font-semibold leading-none mt-2">GO — ReWear Campus</h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-[15px]">{['Expected recurring student demand', 'Favourable external environment', 'Potential positive sustainability impact', 'Feasibility of a campus pilot'].map((r) => <li key={r} className="flex gap-2"><Check size={18} className="text-gold shrink-0 mt-0.5" />{r}</li>)}</ul>
            <p className="text-ivory/65 text-[13px] mt-5">A preliminary entrepreneurial decision, subject to customer validation during the pilot.</p>
          </div>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16 lg:mt-24">
        <SectionHead eyebrow="Founding team" title="The people behind the rack" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map((t) => (
            <div key={t.n} className="rounded-2xl border border-line bg-surface p-5">
              <div className="h-20 w-20 rounded-full bg-tint grid place-items-center font-serif text-[30px] font-semibold text-brand">{t.n.split(' ').filter((w) => !w.endsWith('.')).map((w) => w[0]).slice(0, 2).join('')}</div>
              <p className="font-serif text-[22px] font-semibold mt-4 leading-tight">{t.n}</p>
              <p className="text-[13px] text-muted mt-1">Co-founder</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted mt-4">Monograms are used in place of photographs. ReWear Campus is a student venture and is not affiliated with, or endorsed by, CHRIST University.</p>
        <div className="flex flex-wrap gap-3 mt-8"><LinkButton href="#feedback">Help us validate the idea</LinkButton><LinkButton href="#explore" variant="secondary">See the collection</LinkButton></div>
      </section>
    </div>
  );
}
