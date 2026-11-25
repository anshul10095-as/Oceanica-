import { useState } from 'react';
import { CheckCircle2, User, Shirt, Heart, Ticket, Sparkles, MessageSquare, BookOpen, LayoutDashboard, RotateCcw, Smartphone, Share, PlusSquare, Download, MonitorSmartphone, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/store';
import { useRouter } from '../lib/router';
import { Button, Chip, DemoNote, Field, LinkButton, Modal, SectionHead, useToast } from '../components/ui';
import { FAQ } from './Home';
import { usePWA } from '../lib/pwa';
import { cx } from '../lib/util';

// ---------------- Feedback ----------------
const Q = {
  frequency: ['Never', 'Once a year', '2–3 times a year', '4 or more times a year'],
  categories: ['Blazers and suits', 'Formal shirts and trousers', 'Kurta sets', 'Sarees', 'Lehengas and Anarkalis', 'Complete outfit sets'],
  cleanedOk: ['Yes', 'Maybe, depending on hygiene proof', 'No'],
  price: ['Under ₹300', '₹300–₹499', '₹500–₹699', '₹700 or more'],
  subscription: ['Very interested', 'Somewhat interested', 'Not interested'],
  pickup: ['Campus pop-up rack', 'Hostel or department drop-off', 'Delivery to my address', 'No preference'],
  hygiene: ['Not concerned', 'Somewhat concerned', 'Very concerned'],
};

export function FeedbackPage() {
  const { actions } = useStore();
  const toast = useToast();
  const blank = { frequency: '', categories: [] as string[], cleanedOk: '', price: '', subscription: '', pickup: '', hygiene: '', likelihood: 0, comments: '' };
  const [f, setF] = useState(blank);
  const [done, setDone] = useState(false);
  const Single = ({ k, label }: { k: 'frequency' | 'cleanedOk' | 'price' | 'subscription' | 'pickup' | 'hygiene'; label: string }) => (
    <fieldset><legend className="font-semibold mb-2.5">{label}</legend><div className="flex flex-wrap gap-2">{Q[k].map((o) => <Chip key={o} active={f[k] === o} onClick={() => setF({ ...f, [k]: o })}>{o}</Chip>)}</div></fieldset>
  );
  const submit = () => {
    if (!f.frequency || !f.cleanedOk || !f.price || !f.subscription || !f.pickup || !f.hygiene || !f.likelihood || !f.categories.length) { toast('err', 'Answer every question except the open comment.'); return; }
    const r = actions.submitFeedback(f);
    if (r.ok) { setDone(true); setF(blank); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  return (
    <div className="gutter max-w-[860px] mx-auto pt-8 lg:pt-12">
      <p className="eyebrow text-brand">Pilot validation</p>
      <h1 className="font-serif text-[40px] lg:text-[58px] font-semibold leading-none mt-2">Help us test the idea</h1>
      <p className="text-muted mt-3 max-w-[58ch]">Nine short questions, about two minutes. Answers are anonymous and stay in this browser for the demo; the team reviews them in aggregate.</p>
      {done && <div className="mt-6 rounded-2xl bg-tint p-5 flex gap-3 anim-rise"><CheckCircle2 className="text-brand shrink-0" /><div><b>Thank you. Your response was recorded.</b><p className="text-[14px] text-muted">You can submit again for another person on this device, for example at a pop-up.</p></div></div>}
      <div className="mt-8 space-y-8 rounded-2xl border border-line bg-surface p-5 lg:p-8">
        <Single k="frequency" label="1. How often do you buy clothes for a specific occasion (interview, fest, wedding)?" />
        <fieldset><legend className="font-semibold mb-2.5">2. Which categories would you rent? <span className="text-muted font-normal">(choose any)</span></legend><div className="flex flex-wrap gap-2">{Q.categories.map((o) => <Chip key={o} active={f.categories.includes(o)} onClick={() => setF({ ...f, categories: f.categories.includes(o) ? f.categories.filter((x) => x !== o) : [...f.categories, o] })}>{o}</Chip>)}</div></fieldset>
        <Single k="cleanedOk" label="3. Would you rent clothes that have been professionally cleaned after another wearer?" />
        <Single k="price" label="4. What would you pay to rent a blazer or kurta set for 48 hours?" />
        <Single k="subscription" label="5. How interested are you in a monthly rental subscription?" />
        <Single k="pickup" label="6. How would you prefer to collect and return?" />
        <Single k="hygiene" label="7. How concerned are you about hygiene in rented clothing?" />
        <fieldset><legend className="font-semibold mb-2.5">8. How likely are you to use ReWear Campus? <span className="text-muted font-normal">(1 = not at all, 5 = very likely)</span></legend><div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={f.likelihood === n} onClick={() => setF({ ...f, likelihood: n })} className={cx('h-12 w-12 rounded-xl border font-bold tnum', f.likelihood === n ? 'bg-brand text-onbrand border-brand' : 'border-line')}>{n}</button>)}</div></fieldset>
        <Field label="9. Anything else we should know?" htmlFor="fb-c"><textarea id="fb-c" rows={4} className="field" maxLength={600} value={f.comments} onChange={(e) => setF({ ...f, comments: e.target.value })} placeholder="Optional" /></Field>
        <Button size="lg" className="w-full sm:w-auto" onClick={submit}>Submit response</Button>
      </div>
    </div>
  );
}

// ---------------- Profile ----------------
export function ProfilePage() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [s, setS] = useState(state.student);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('rewear-theme') ?? 'system'; } catch { return 'system'; } });
  const applyTheme = (t: string) => { setTheme(t); try { localStorage.setItem('rewear-theme', t); } catch { /* ignore */ } if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); };
  const links = [
    { to: 'wardrobe', i: Shirt, t: 'My Wardrobe', s: 'Rentals, passes and returns' },
    { to: 'wishlist', i: Heart, t: 'Wishlist', s: `${state.wishlist.length} saved` },
    { to: 'pass', i: Ticket, t: 'ReWear Pass', s: 'Membership and credits' },
    { to: 'fit', i: Sparkles, t: 'Find My Fit', s: 'Outfit and size matching' },
    { to: 'feedback', i: MessageSquare, t: 'Pilot feedback', s: 'Two-minute survey' },
    { to: 'story', i: BookOpen, t: 'Our Story', s: 'The entrepreneurial journey' },
    { to: 'demo', i: MonitorSmartphone, t: 'Demo mode', s: 'Guided journeys and reset' },
    { to: 'admin', i: LayoutDashboard, t: 'Demo Admin', s: 'Operations portal' },
  ];
  return (
    <div className="gutter max-w-[960px] mx-auto pt-8 lg:pt-12">
      <div className="flex items-center gap-4">
        <span className="h-16 w-16 rounded-full bg-brand text-onbrand grid place-items-center font-serif text-2xl font-semibold">{state.student.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
        <div className="flex-1 min-w-0"><h1 className="font-serif text-[32px] font-semibold leading-tight truncate">{state.student.name}</h1><p className="text-muted text-[14px] truncate">{state.student.programme} · {state.student.college}</p></div>
        <Button variant="secondary" size="sm" onClick={() => { setS(state.student); setEdit(true); }}><User size={15} />Edit</Button>
      </div>
      <DemoNote className="mt-3">Demo student profile. No login or password is used; details stay in this browser.</DemoNote>
      <ul className="grid sm:grid-cols-2 gap-3 mt-8">
        {links.map(({ to, i: I, t, s: sub }) => <li key={to}><a href={`#${to}`} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-fg/30"><span className="h-11 w-11 rounded-full bg-tint text-brand grid place-items-center"><I size={19} /></span><span><b className="block">{t}</b><span className="text-[13px] text-muted">{sub}</span></span></a></li>)}
      </ul>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <p className="font-semibold mb-3">Appearance</p>
        <div className="flex gap-2">{[['system', 'System', MonitorSmartphone], ['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([v, l, I]) => { const Icon = I as typeof Sun; return <Chip key={v as string} active={theme === v} onClick={() => applyTheme(v as string)}><span className="inline-flex items-center gap-1.5"><Icon size={14} />{l as string}</span></Chip>; })}</div>
      </div>
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit profile">
        <div className="space-y-4">
          <Field label="Name" htmlFor="p-n"><input id="p-n" className="field" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></Field>
          <Field label="Programme" htmlFor="p-p"><input id="p-p" className="field" value={s.programme} onChange={(e) => setS({ ...s, programme: e.target.value })} /></Field>
          <Field label="College" htmlFor="p-c"><input id="p-c" className="field" value={s.college} onChange={(e) => setS({ ...s, college: e.target.value })} /></Field>
          <Button className="w-full" onClick={() => { if (!s.name.trim()) { toast('err', 'Name cannot be empty.'); return; } actions.updateStudent(s); setEdit(false); toast('ok', 'Profile updated'); }}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Demo mode ----------------
const JOURNEYS = [
  { t: 'Rental', steps: [['Homepage', 'home'], ['Formal Wear', 'formal'], ['Select blazer', 'product-rw-mf-01'], ['Size, dates, Rent Now', 'product-rw-mf-01'], ['Checkout and confirmation', 'bag'], ['My Wardrobe', 'wardrobe']] },
  { t: 'Subscription', steps: [['ReWear Pass', 'pass'], ['Compare and subscribe', 'pass'], ['Redeem a credit on a blazer', 'product-rw-wf-01'], ['View remaining credits', 'pass']] },
  { t: 'Campus Pop-Up', steps: [['Campus Pop-Ups', 'popups'], ['Placement Week Pop-Up', 'popup-pu-placement'], ['Reserve a fitting slot', 'popup-pu-placement'], ['See it in My Wardrobe', 'wardrobe']] },
  { t: 'Administration', steps: [['Admin dashboard', 'admin'], ['Rentals: mark collected', 'admin-rentals'], ['Process return and quality check', 'admin-rentals'], ['Simulate deposit refund', 'admin-rentals']] },
  { t: 'Sustainability', steps: [['Complete a rental (journeys 1 and 4)', 'admin-rentals'], ['Garment reuse count updates', 'admin-maintenance'], ['Sustainability dashboard', 'sustainability']] },
];

export function DemoPage() {
  const { state, actions } = useStore();
  const { go } = useRouter();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="gutter max-w-[1100px] mx-auto pt-8 lg:pt-12">
      <p className="eyebrow text-terra">Demo mode</p>
      <h1 className="font-serif text-[40px] lg:text-[58px] font-semibold leading-none mt-2">Classroom walkthrough</h1>
      <p className="text-muted mt-3 max-w-[62ch]">Everything here runs in this browser. Payments are simulated, seeded bookings are labelled as demo data, and no real passwords are used. Open the student app and the admin portal in two tabs and they stay in sync.</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <button onClick={() => { actions.setRole('student'); go('home'); }} className="text-left rounded-2xl border border-line bg-surface p-6 hover:border-brand"><User className="text-brand" /><p className="font-serif text-[26px] font-semibold mt-3">Continue as Student</p><p className="text-[14px] text-muted">Demo Student · CHRIST University, Central Campus</p></button>
        <button onClick={() => { actions.setRole('admin'); go('admin'); }} className="text-left rounded-2xl bg-forest text-ivory p-6 hover:brightness-110"><LayoutDashboard className="text-gold" /><p className="font-serif text-[26px] font-semibold mt-3">Open Demo Admin</p><p className="text-[14px] text-ivory/70">Operations portal · no password</p></button>
      </div>
      <SectionHead className="mt-14" eyebrow="Guided journeys" title="Five demonstrations" />
      <div className="space-y-3">
        {JOURNEYS.map((j, i) => (
          <div key={j.t} className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-serif text-[22px] font-semibold"><span className="text-gold tnum mr-2">{i + 1}</span>{j.t}</p>
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 mt-3 text-[13px]">
              {j.steps.map(([l, to], k) => <li key={l} className="flex items-center gap-1"><a href={`#${to}`} className="rounded-full bg-tint px-3 py-1.5 font-semibold hover:bg-sage/50">{l}</a>{k < j.steps.length - 1 && <span className="text-muted">→</span>}</li>)}
            </ol>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-terra/60 p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]"><b>Reset demo data</b><p className="text-[13px] text-muted">Restores the catalogue, seeded demo bookings and events, and clears your bag, rentals, memberships and feedback. Data seeded on {state.seededAt}.</p></div>
        <Button variant="danger" onClick={() => setConfirm(true)}><RotateCcw size={16} />Reset demo data</Button>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset all demo data?">
        <p className="text-[14px] text-muted">This clears every booking, membership, appointment and feedback response created in this browser. It cannot be undone.</p>
        <div className="flex gap-3 mt-5"><Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>Keep data</Button><Button className="flex-1 !bg-terra !text-white" onClick={() => { actions.reset(); setConfirm(false); toast('ok', 'Demo data reset'); go('home'); }}>Reset</Button></div>
      </Modal>
    </div>
  );
}

// ---------------- Policies and help ----------------
const POLICIES: Record<string, { t: string; body: string[] }> = {
  rental: { t: 'Rental Policy', body: [
    'Rentals run for 48 or 72 hours from your pickup slot. Return the garment to the same rack by 6 PM on the return date shown on your pickup pass.',
    'A refundable deposit is collected with every rental and held separately from the rental fee. It is refunded after the garment passes a quality check, usually within two working days of return.',
    'Normal wear is expected and never charged. Stains that cannot be removed, tears and missing parts are charged at repair or replacement cost, deducted from the deposit and never more than the deposit held. Every deduction is itemised.',
    'Late returns: extensions can be requested from My Wardrobe and are approved only if the next booking allows. Unapproved late returns may be charged the daily extension rate.',
    'All prices shown are proposed pilot prices and may change after customer validation.',
  ] },
  subscription: { t: 'Subscription Policy', body: [
    'ReWear Pass plans run in 30-day cycles. Credits are added at the start of each cycle, do not roll over and have no cash value.',
    'One credit covers the rental fee for one eligible garment for 48 hours. Deposits and the 72-hour surcharge are payable separately. Unlimited rentals are not offered.',
    'Upgrades apply immediately; you pay the price difference for the current cycle. Downgrades take effect at renewal.',
    'Cancelling stops renewal. Credits remain usable until the end of the current cycle.',
  ] },
  cancellation: { t: 'Cancellation Policy', body: [
    'Cancel free of charge up to 24 hours before pickup from My Wardrobe. The rental fee and deposit are refunded in full and any ReWear Pass credit is restored.',
    'Cancellations within 24 hours of pickup are reviewed by the team. During the pilot we aim to refund these too unless the garment was turned away from another student.',
    'If a garment does not fit at pickup, swap sizes on the spot where stock allows, or cancel that item in full.',
  ] },
  privacy: { t: 'Privacy Policy', body: [
    'We collect only what a rental needs: your name, college, phone number, email, pickup choice and booking history.',
    'This prototype stores data in your browser only. It does not send personal data to a server, does not use advertising trackers and does not collect card or UPI credentials.',
    'Feedback responses are anonymous and reviewed in aggregate.',
    'The offline cache stores the app shell and static assets only, not your bookings or contact details.',
  ] },
};

export function PolicyPage() {
  const { route } = useRouter();
  const p = POLICIES[route.arg] ?? POLICIES.rental;
  return (
    <div className="gutter max-w-[780px] mx-auto pt-8 lg:pt-12">
      <div className="flex flex-wrap gap-2 mb-6">{Object.entries(POLICIES).map(([k, v]) => <a key={k} href={`#policy-${k}`} className={cx('h-9 px-4 rounded-full border text-[13px] font-semibold inline-flex items-center', route.arg === k || (!POLICIES[route.arg] && k === 'rental') ? 'bg-brand text-onbrand border-brand' : 'border-line')}>{v.t}</a>)}</div>
      <h1 className="font-serif text-[40px] lg:text-[54px] font-semibold leading-none">{p.t}</h1>
      <p className="text-[13px] text-muted mt-3">Draft pilot policy · subject to legal review before launch</p>
      <div className="mt-6 space-y-4 text-[16px] leading-relaxed">{p.body.map((b) => <p key={b}>{b}</p>)}</div>
    </div>
  );
}

export function HelpPage() {
  const pwa = usePWA();
  const [copied, setCopied] = useState(false);
  const email = 'hello@rewearcampus.example';
  return (
    <div className="gutter max-w-[1000px] mx-auto pt-8 lg:pt-12">
      <h1 className="font-serif text-[40px] lg:text-[58px] font-semibold leading-none">Help Centre</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="font-semibold">Contact the team</p>
          <p className="text-[14px] text-muted mt-1">During the pilot, the founders staff every pop-up rack. Placeholder address until a domain is set up:</p>
          <div className="flex items-center gap-2 mt-3"><code className="rounded-lg bg-tint px-3 py-2 text-[13px] select-all">{email}</code><Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(email).then(() => setCopied(true), () => setCopied(false)); }}>{copied ? 'Copied' : 'Copy'}</Button></div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5" id="install">
          <p className="font-semibold flex items-center gap-2"><Smartphone size={18} className="text-brand" />Add ReWear to your home screen</p>
          {pwa.preview ? <p className="text-[13px] text-muted mt-1">This is a sandboxed preview, so installation is not available here. On the deployed site:</p> : null}
          <ul className="text-[14px] mt-3 space-y-2">
            <li className="flex gap-2"><Download size={16} className="text-brand mt-0.5 shrink-0" /><span><b>Android / Chrome / Edge:</b> tap <i>Install app</i> in the browser menu, or the Install button in the top bar when it appears.</span></li>
            <li className="flex gap-2"><Share size={16} className="text-brand mt-0.5 shrink-0" /><span><b>iPhone / iPad (Safari):</b> tap Share, then <i>Add to Home Screen</i> <PlusSquare size={14} className="inline" />.</span></li>
            <li className="flex gap-2"><MonitorSmartphone size={16} className="text-brand mt-0.5 shrink-0" /><span><b>Windows / macOS:</b> in Chrome or Edge, use the install icon at the right of the address bar.</span></li>
          </ul>
          {pwa.canInstall && <Button className="mt-4" onClick={pwa.install}><Download size={16} />Install ReWear Campus</Button>}
          {pwa.standalone && <p className="text-[13px] text-brand font-semibold mt-3">You are using the installed app.</p>}
        </div>
      </div>
      <SectionHead className="mt-12" eyebrow="FAQ" title="Common questions" />
      <FAQ />
      <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="#policy-rental" variant="secondary">Rental policy</LinkButton><LinkButton href="#policy-cancellation" variant="secondary">Cancellation policy</LinkButton><LinkButton href="#feedback" variant="ghost">Share feedback</LinkButton></div>
    </div>
  );
}
