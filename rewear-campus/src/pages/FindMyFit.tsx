import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Ruler, Sparkles } from 'lucide-react';
import { useStore } from '../store/store';
import { ProductImage } from '../components/Product';
import { Button, Chip, DemoNote, LinkButton } from '../components/ui';
import { OCCASIONS } from '../data/catalogue';
import { findUnit } from '../store/rules';
import { addDays, cx, fmtDate, inr, todayISO } from '../lib/util';
import type { Gender, Occasion, Product } from '../data/types';

interface Answers { occasion: Occasion | ''; gender: Gender | ''; line: 'formal' | 'ethnic' | 'either' | ''; size: string; budget: number; date: string; colors: string[] }
const LETTERS = ['XS', 'S', 'M', 'L', 'XL'];
const BUDGETS = [300, 400, 500, 700];
const COLORS = ['Black', 'Blue', 'Grey', 'White', 'Beige', 'Green', 'Red', 'Pink', 'Gold', 'Yellow', 'Orange'];

/** Translate a usual letter size into the size label each garment type uses. */
export function sizeFor(p: Product, letter: string): string | null {
  if (p.sizes.includes(letter)) return letter;
  const i = LETTERS.indexOf(letter);
  if (p.category === 'Trousers') return p.gender === 'men' ? ['30', '30', '32', '34', '36'][i] : ['26', '28', '30', '32', '32'][i];
  if (p.category === 'Saree') return ['Blouse 34', 'Blouse 34', 'Blouse 36', 'Blouse 38', 'Blouse 38'][i];
  if (letter === 'XS' && p.sizes.includes('S')) return 'S';
  if (letter === 'XL' && p.sizes.includes('L')) return 'L';
  return null;
}

function recommend(state: ReturnType<typeof useStore>['state'], a: Answers) {
  const out: { p: Product; size: string | null; score: number; reasons: string[]; caveats: string[]; available: boolean }[] = [];
  for (const p of state.products) {
    if (p.archived) continue;
    if (a.gender && p.gender !== a.gender) continue;
    if (a.occasion && !p.occasions.includes(a.occasion)) continue;
    if (a.line && a.line !== 'either' && p.line !== a.line) continue;
    const reasons: string[] = []; const caveats: string[] = [];
    let score = p.popularity / 20;
    const occ = OCCASIONS.find((o) => o.id === a.occasion);
    if (occ) reasons.push(`made for ${occ.short.toLowerCase()}`);
    const size = a.size ? sizeFor(p, a.size) : null;
    if (a.size && !size) continue;
    if (size) { reasons.push(`stocked in your size (${size})`); score += 2; }
    if (p.rentalPrice <= a.budget) { reasons.push(`within your ${inr(a.budget)} budget`); score += 2; } else continue;
    if (a.colors.length) { if (a.colors.includes(p.colorFamily)) { reasons.push(`in ${p.color.toLowerCase()}, a colour you picked`); score += 3; } else caveats.push(`${p.color} is outside your colour picks`); }
    let available = true;
    if (a.date && size) {
      available = findUnit(state, p.id, size, a.date, 2).reason === 'ok';
      if (available) { reasons.push(`free on ${fmtDate(a.date)}`); score += 3; } else { caveats.push(`not free in ${size} on ${fmtDate(a.date)}`); score -= 6; }
    }
    out.push({ p, size, score, reasons, caveats, available });
  }
  return out.sort((x, y) => y.score - x.score).slice(0, 6);
}

export default function FindMyFit() {
  const { state } = useStore();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ occasion: '', gender: '', line: '', size: '', budget: 500, date: addDays(todayISO(), 5), colors: [] });
  const results = useMemo(() => (step === 6 ? recommend(state, a) : []), [step, state, a]);
  const steps = [
    { q: 'What is your occasion?', ok: !!a.occasion, body: <div className="grid sm:grid-cols-2 gap-2">{OCCASIONS.map((o) => <Opt key={o.id} on={a.occasion === o.id} onClick={() => setA({ ...a, occasion: o.id })} t={o.label} s={o.blurb} />)}</div> },
    { q: 'What clothing style do you prefer?', ok: !!a.gender && !!a.line, body: (
      <div className="space-y-5">
        <div><p className="text-[13px] font-semibold mb-2">Fit</p><div className="flex gap-2"><Chip active={a.gender === 'men'} onClick={() => setA({ ...a, gender: 'men' })}>Men's fit</Chip><Chip active={a.gender === 'women'} onClick={() => setA({ ...a, gender: 'women' })}>Women's fit</Chip></div></div>
        <div><p className="text-[13px] font-semibold mb-2">Style</p><div className="flex flex-wrap gap-2">{(['formal', 'ethnic', 'either'] as const).map((l) => <Chip key={l} active={a.line === l} onClick={() => setA({ ...a, line: l })}>{l === 'either' ? 'Show me both' : l === 'formal' ? 'Formal' : 'Ethnic'}</Chip>)}</div></div>
      </div>) },
    { q: 'What is your usual size?', ok: !!a.size, body: (
      <div>
        <div className="flex flex-wrap gap-2">{LETTERS.map((s) => <Chip key={s} active={a.size === s} onClick={() => setA({ ...a, size: s })} className="min-w-[56px]">{s}</Chip>)}</div>
        <div className="mt-5 rounded-xl bg-tint p-4 text-[13px]">
          <p className="font-semibold flex items-center gap-1.5 mb-2"><Ruler size={15} />Practical size guide (garment measurements)</p>
          <div className="overflow-x-auto"><table className="w-full tnum"><thead><tr className="text-left text-muted"><th className="pr-3 py-1">Size</th><th className="pr-3">Men's chest</th><th className="pr-3">Women's bust</th><th className="pr-3">Men's waist</th><th>Women's waist</th></tr></thead>
            <tbody>{[['XS', '—', '33"', '—', '26"'], ['S', '38"', '35"', '30"', '28"'], ['M', '40"', '37"', '32"', '30"'], ['L', '42"', '39"', '34"', '32"'], ['XL', '44"', '—', '36"', '—']].map((r) => <tr key={r[0]} className={cx(a.size === r[0] && 'font-bold')}>{r.map((c, i) => <td key={i} className="pr-3 py-1">{c}</td>)}</tr>)}</tbody></table></div>
          <p className="text-muted mt-2">Measure a blazer or kurta you own, flat across the chest, and double it. Between sizes? Size up for blazers, down for kurtas.</p>
        </div>
      </div>) },
    { q: 'What is your budget?', ok: true, body: <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{BUDGETS.map((b) => <Opt key={b} on={a.budget === b} onClick={() => setA({ ...a, budget: b })} t={b === 700 ? `Up to ${inr(700)}` : `Up to ${inr(b)}`} s={b === 300 ? 'Shirts, trousers' : b === 400 ? 'Blazers, kurtas' : b === 500 ? 'Sarees, premium blazers' : 'Suits, lehengas'} />)}</div> },
    { q: 'When do you need the outfit?', ok: !!a.date && a.date > todayISO(), body: <div className="max-w-xs"><label htmlFor="fit-date" className="text-[13px] font-semibold">Pickup date</label><input id="fit-date" type="date" className="field mt-1.5" min={addDays(todayISO(), state.policies.leadDays)} max={addDays(todayISO(), state.policies.maxAdvanceDays)} value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} /><p className="text-[12px] text-muted mt-1.5">We check real availability in your size for a 48-hour rental from this date.</p></div> },
    { q: 'What colours do you prefer?', ok: true, body: <div><div className="flex flex-wrap gap-2">{COLORS.map((c) => <Chip key={c} active={a.colors.includes(c)} onClick={() => setA({ ...a, colors: a.colors.includes(c) ? a.colors.filter((x) => x !== c) : [...a.colors, c] })}>{c}</Chip>)}</div><p className="text-[12px] text-muted mt-3">Optional. Skip to see every colour.</p></div> },
  ];

  return (
    <div className="gutter max-w-[1100px] mx-auto pt-6 lg:pt-10">
      <p className="eyebrow text-brand flex items-center gap-2"><Sparkles size={14} />Find My Fit</p>
      <h1 className="font-serif text-[40px] lg:text-[58px] font-semibold leading-none mt-2">Six questions to your outfit</h1>
      <p className="text-muted mt-3 max-w-[60ch]">A rules-based matcher: it filters the live catalogue by your answers and checks stock in your size for your date. It is not an AI model.</p>

      {step < 6 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 lg:p-8">
          <div className="flex gap-1.5 mb-6" aria-hidden="true">{steps.map((_, i) => <span key={i} className={cx('h-1 flex-1 rounded-full', i <= step ? 'bg-brand' : 'bg-line')} />)}</div>
          <p className="text-[13px] text-muted font-semibold tnum">Question {step + 1} of 6</p>
          <h2 className="font-serif text-[28px] lg:text-[34px] font-semibold mt-1 mb-5">{steps[step].q}</h2>
          {steps[step].body}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} />Back</Button>
            <Button disabled={!steps[step].ok} onClick={() => setStep(step + 1)}>{step === 5 ? 'Show my matches' : 'Next'}<ArrowRight size={16} /></Button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-[14px] text-muted">{results.length} match{results.length === 1 ? '' : 'es'} for {OCCASIONS.find((o) => o.id === a.occasion)?.short}, size {a.size}, up to {inr(a.budget)}, from {fmtDate(a.date)}.</p>
            <Button variant="secondary" size="sm" onClick={() => setStep(0)}><RotateCcw size={15} />Start again</Button>
          </div>
          {results.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(({ p, size, reasons, caveats, available }) => (
                <article key={p.id} className="rounded-2xl border border-line bg-surface overflow-hidden flex flex-col">
                  <a href={`#product-${p.id}`} className="block aspect-[4/3] bg-tint"><ProductImage p={p} /></a>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between gap-2"><a href={`#product-${p.id}`} className="font-semibold hover:underline">{p.name}</a><b className="tnum">{inr(p.rentalPrice)}</b></div>
                    <p className="text-[13px] mt-2"><span className="text-brand font-semibold">Recommended because</span> it is {reasons.join(', ')}.</p>
                    {caveats.length > 0 && <p className="text-[12px] text-terra mt-1">Note: {caveats.join('; ')}.</p>}
                    {size && <p className="text-[12px] text-muted mt-2">{size}: {p.measurements[size]?.map((m) => `${m.label} ${m.value}`).join(' · ')}</p>}
                    <LinkButton href={`#product-${p.id}`} size="sm" variant={available ? 'primary' : 'secondary'} className="mt-4 self-start">{available ? 'Rent this' : 'See other dates'}</LinkButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center"><p className="font-serif text-2xl font-semibold">No exact matches</p><p className="text-muted mt-1">Try a higher budget, or choose “Show me both” styles.</p><Button className="mt-4" onClick={() => setStep(3)}>Change budget</Button></div>
          )}
          <DemoNote className="mt-6">Matching uses your answers and live stock only. Sizes are translated from letter sizes to waist and blouse sizes where needed.</DemoNote>
        </div>
      )}
    </div>
  );
}

const Opt = ({ on, onClick, t, s }: { on: boolean; onClick: () => void; t: string; s: string }) => (
  <button type="button" aria-pressed={on} onClick={onClick} className={cx('rounded-xl border p-4 text-left transition', on ? 'border-brand ring-1 ring-brand bg-tint' : 'border-line hover:border-fg/40')}><b className="block text-[15px]">{t}</b><span className="text-[12.5px] text-muted">{s}</span></button>
);
