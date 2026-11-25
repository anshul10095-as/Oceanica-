import { useState } from 'react';
import { Check, Minus, Ticket, Loader2, Smartphone, CreditCard, ArrowRight } from 'lucide-react';
import { useStore } from '../store/store';
import { Badge, Button, DemoNote, LinkButton, Modal, SectionHead, useToast } from '../components/ui';
import { activeSubscription, creditEligible, creditsLeft, planOf } from '../store/rules';
import { FAQ } from './Home';
import { cx, diffDays, fmtDate, inr, todayISO } from '../lib/util';
import type { Plan } from '../data/types';
import { ProductCard } from '../components/Product';

const SUB_FAQ = [
  ['What is a rental credit?', 'One credit covers the rental fee for one eligible garment for 48 hours. The refundable deposit is still payable, and choosing 72 hours adds the third-day charge.'],
  ['Which garments are eligible?', 'Campus Basic and Plus credits cover the standard collection (rentals up to ₹499). Campus Elite credits also cover selected premium pieces such as the charcoal suit, pantsuit, silk saree and Anarkali. Sherwanis, lehengas and the premium occasion-wear set are paid rentals.'],
  ['Do unused credits roll over?', 'No. Credits reset every 30-day cycle. There are no unlimited plans.'],
  ['Can I upgrade or cancel?', 'Upgrade any time and pay only the difference for the current cycle; your used credits carry over. Cancelling stops renewal; your credits stay usable until the cycle ends.'],
  ['What happens if I cancel a booking that used a credit?', 'If you cancel within the free cancellation window, the credit returns to your balance for the current cycle.'],
];

export default function PassPage() {
  const { state, actions } = useStore();
  const toast = useToast();
  const sub = activeSubscription(state);
  const [choice, setChoice] = useState<Plan | null>(null);
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [busy, setBusy] = useState(false);
  const plans = state.policies.plans;
  const current = sub ? planOf(state, sub.planId) : null;

  const confirm = () => {
    if (!choice) return;
    setBusy(true);
    setTimeout(() => {
      const r = current ? actions.upgrade(choice.id) : actions.subscribe(choice.id, method);
      setBusy(false);
      if (!r.ok) { toast('err', r.error); return; }
      toast('ok', current ? `Upgraded to ${choice.name}` : `Welcome to ${choice.name}. ${choice.credits} credit${choice.credits > 1 ? 's' : ''} added.`);
      setChoice(null);
    }, 900);
  };

  const rows: [string, (p: Plan) => React.ReactNode][] = [
    ['Monthly price', (p) => <b className="tnum">{inr(p.price)}</b>],
    ['Rental credits each 30 days', (p) => <b className="tnum">{p.credits}</b>],
    ['Value of credits at ₹399 standard rental', (p) => <span className="tnum">{inr(p.credits * 399)}</span>],
    ['Formal and ethnic collections', () => <Check size={18} className="text-brand mx-auto" />],
    ['Campus pickup and return', () => <Check size={18} className="text-brand mx-auto" />],
    ['Priority reservations', (p) => p.priority ? <Check size={18} className="text-brand mx-auto" /> : <Minus size={18} className="text-muted mx-auto" />],
    ['Discount on additional rentals', (p) => p.discount ? `${p.discount}%` : <Minus size={18} className="text-muted mx-auto" />],
    ['Credits cover selected premium pieces', (p) => p.premiumAccess ? <Check size={18} className="text-brand mx-auto" /> : <Minus size={18} className="text-muted mx-auto" />],
    ['Unlimited rentals', () => <span className="text-muted text-[12px]">Not offered</span>],
  ];

  const eligibleSample = state.products.filter((p) => !p.archived && (sub ? creditEligible(state, p, sub) : p.tier === 'standard')).sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  return (
    <div>
      <section className="bg-forest text-ivory">
        <div className="gutter max-w-[1440px] mx-auto py-12 lg:py-20 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="eyebrow text-gold mb-3">ReWear Pass</p>
            <h1 className="font-serif text-[46px] lg:text-[76px] font-semibold leading-[0.95]">More occasions.<br /><span className="italic text-gold">One</span> monthly pass.</h1>
            <p className="text-ivory/75 mt-5 max-w-[50ch] text-[16px]">For semesters with placements, fests and farewells back to back. Fixed monthly credits, priority on busy weeks, and no garment you will wear once sitting in your cupboard.</p>
            <p className="text-ivory/55 mt-4 text-[12px]">Proposed pilot prices, subject to customer validation.</p>
          </div>
          {sub && current ? (
            <div className="rounded-[22px] bg-gradient-to-br from-[#e6cf99] to-[#b8975a] text-forest-deep p-6 shadow-lift">
              <div className="flex justify-between"><span className="text-[11px] font-bold tracking-[0.3em]">REWEAR PASS</span><Badge tone="brand">{sub.status === 'active' ? 'Active' : 'Ends at cycle close'}</Badge></div>
              <p className="font-serif text-[36px] font-semibold mt-6">{current.name}</p>
              <div className="flex items-end justify-between mt-6">
                <div><p className="text-[12px] font-semibold opacity-70">Credits remaining</p><p className="font-serif text-[56px] leading-none font-semibold tnum">{creditsLeft(sub)}<span className="text-[22px] opacity-60">/{sub.creditsTotal}</span></p></div>
                <div className="text-right text-[12px] font-semibold"><p className="opacity-70">Renews / expires</p><p>{fmtDate(sub.expiresAt)}</p><p className="opacity-70">{diffDays(sub.expiresAt, todayISO())} days left</p></div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-forest-deep/15 overflow-hidden"><div className="h-full bg-forest-deep" style={{ width: `${(sub.creditsUsed / sub.creditsTotal) * 100}%` }} /></div>
              <p className="text-[11px] mt-2 font-semibold opacity-70">{sub.creditsUsed} used this cycle · redeemed on {sub.redemptions.length} booking line{sub.redemptions.length === 1 ? '' : 's'}</p>
              <div className="flex gap-2 mt-5">
                <LinkButton href="#explore" variant="primary" size="sm" className="!bg-forest-deep !text-ivory">Redeem a credit</LinkButton>
                {sub.status === 'active' && <Button size="sm" variant="secondary" className="!border-forest-deep/40 !text-forest-deep" onClick={() => { const r = actions.cancelSubscription(); toast(r.ok ? 'info' : 'err', r.ok ? 'Cancellation requested. Your credits stay usable until the cycle ends.' : r.error); }}>Cancel renewal</Button>}
              </div>
            </div>
          ) : (
            <div className="hidden lg:grid grid-cols-3 gap-3">
              {plans.map((p, i) => <div key={p.id} className={cx('rounded-2xl p-4 aspect-[3/4] flex flex-col justify-between', i === 1 ? 'bg-gold text-forest-deep -translate-y-6' : 'bg-forest-deep/60 border border-ivory/15')}><span className="text-[10px] font-bold tracking-[0.25em]">PASS</span><span className="font-serif text-[24px] font-semibold leading-tight">{p.name.replace('Campus ', '')}</span><span className="tnum font-bold">{p.credits} credit{p.credits > 1 ? 's' : ''}</span></div>)}
            </div>
          )}
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-14">
        <SectionHead eyebrow="Plans" title="Choose your pass" sub="Every plan includes campus pickup and return. Credits reset every 30 days and do not roll over." />
        <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
          {plans.map((p) => {
            const isCurrent = current?.id === p.id;
            const lower = current && p.price < current.price;
            return (
              <div key={p.id} className={cx('relative rounded-[22px] p-6 lg:p-7 border flex flex-col', p.id === 'plus' ? 'bg-forest text-ivory border-forest md:-translate-y-3 shadow-lift' : 'bg-surface border-line')}>
                {p.id === 'plus' && <span className="absolute -top-3 left-6"><Badge tone="gold" className="!bg-gold !text-forest-deep">Recommended</Badge></span>}
                <h3 className="font-serif text-[30px] font-semibold">{p.name}</h3>
                <p className="mt-3"><span className="font-serif text-[52px] font-semibold leading-none tnum">{inr(p.price)}</span><span className="opacity-70"> /month</span></p>
                <p className={cx('text-[13px] mt-1', p.id === 'plus' ? 'text-ivory/70' : 'text-muted')}>{inr(Math.round(p.price / p.credits))} per credit</p>
                <ul className="mt-6 space-y-2.5 text-[14px] flex-1">{p.features.map((f) => <li key={f} className="flex gap-2.5"><Check size={17} className={cx('shrink-0 mt-0.5', p.id === 'plus' ? 'text-gold' : 'text-brand')} />{f}</li>)}</ul>
                <Button className="mt-7 w-full" variant={p.id === 'plus' ? 'gold' : 'primary'} disabled={isCurrent || !!lower} onClick={() => setChoice(p)}>
                  {isCurrent ? 'Your current plan' : lower ? 'Downgrade at renewal' : current ? `Upgrade for ${inr(p.price - current.price)}` : `Choose ${p.name.replace('Campus ', '')}`}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="gutter max-w-[1100px] mx-auto mt-16">
        <h2 className="font-serif text-[30px] lg:text-[40px] font-semibold mb-5">Compare plans</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-[14px] bg-surface">
            <thead><tr className="border-b border-line"><th className="text-left p-4 font-semibold">Benefit</th>{plans.map((p) => <th key={p.id} className={cx('p-4 font-serif text-[20px] font-semibold', p.id === 'plus' && 'bg-tint')}>{p.name.replace('Campus ', '')}</th>)}</tr></thead>
            <tbody>{rows.map(([l, f]) => <tr key={l} className="border-b border-line last:border-0"><td className="p-4 text-muted">{l}</td>{plans.map((p) => <td key={p.id} className={cx('p-4 text-center', p.id === 'plus' && 'bg-tint')}>{f(p)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="gutter max-w-[1440px] mx-auto mt-16">
        <SectionHead eyebrow="Redeem credits on" title={sub ? 'Covered by your pass' : 'Garments credits can cover'} action={<a href="#explore" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">See all <ArrowRight size={15} /></a>} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 lg:gap-6">{eligibleSample.map((p) => <ProductCard key={p.id} p={p} compact />)}</div>
      </section>

      <section className="gutter max-w-[1100px] mx-auto mt-16">
        <SectionHead eyebrow="Questions" title="How ReWear Pass works" />
        <FAQ items={SUB_FAQ} />
      </section>

      <Modal open={!!choice} onClose={() => !busy && setChoice(null)} title={current ? 'Upgrade your pass' : 'Start your pass'}>
        {choice && (
          <div className="space-y-4">
            <div className="rounded-xl bg-tint p-4 flex items-center gap-3"><Ticket className="text-brand" /><div className="flex-1"><b>{choice.name}</b><p className="text-[13px] text-muted">{choice.credits} credits · 30 days from today</p></div><b className="tnum">{inr(current ? choice.price - current.price : choice.price)}</b></div>
            {current && <p className="text-[13px] text-muted">You pay the difference for this cycle. Your cycle end date stays {sub && fmtDate(sub.expiresAt)}, and credits already used are kept.</p>}
            {!current && (
              <div className="space-y-2" role="radiogroup" aria-label="Payment method">
                {([['upi', Smartphone, 'UPI (simulated)'], ['card', CreditCard, 'Card (simulated, no details collected)']] as const).map(([id, I, l]) => (
                  <button key={id} role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className={cx('w-full flex items-center gap-3 rounded-xl border p-3.5 text-left text-[14px] font-semibold', method === id ? 'border-brand ring-1 ring-brand' : 'border-line')}><I size={18} className="text-brand" />{l}</button>
                ))}
              </div>
            )}
            <DemoNote>Simulated subscription. No money moves and nothing renews automatically in this demo.</DemoNote>
            <Button className="w-full" size="lg" disabled={busy} onClick={confirm}>{busy ? <><Loader2 size={18} className="animate-spin" />Processing</> : `Confirm and pay ${inr(current ? choice.price - current.price : choice.price)}`}</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
