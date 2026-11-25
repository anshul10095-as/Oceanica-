import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search, Heart, ShoppingBag, User, Home, LayoutGrid, Ticket, Shirt, X, ArrowRight, WifiOff, Download, Instagram, Linkedin, Mail, Youtube } from 'lucide-react';
import { Logo } from './Brand';
import { useRouter } from '../lib/router';
import { useStore } from '../store/store';
import { cx } from '../lib/util';
import { OCCASIONS } from '../data/catalogue';
import { ProductImage } from './Product';
import { usePWA } from '../lib/pwa';

const NAV = [
  { to: 'explore', label: 'Explore' },
  { to: 'formal', label: 'Formal Wear' },
  { to: 'ethnic', label: 'Ethnic Wear' },
  { to: 'pass', label: 'ReWear Pass' },
  { to: 'popups', label: 'Campus Pop-Ups' },
  { to: 'sustainability', label: 'Sustainability' },
];

export function slugQuery(q: string) { return q.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const { go } = useRouter();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(() => {
    if (!terms.length) return [];
    return state.products.filter((p) => !p.archived).filter((p) => {
      const hay = `${p.name} ${p.category} ${p.color} ${p.colorFamily} ${p.line} ${p.gender === 'men' ? "men men's" : "women women's"} ${p.occasions.join(' ')} ${p.fabric}`.toLowerCase();
      return terms.every((t) => hay.includes(t.replace(/s$/, '')));
    }).slice(0, 6);
  }, [state.products, terms.join(' ')]);
  const suggestions = ['Navy blazer', 'Saree', 'Kurta set', 'Interview outfit', 'Lehenga', 'Pantsuit', 'Sherwani'];
  const submit = (text: string) => { const s = slugQuery(text); if (!s) return; onClose(); go(`search-${s}`); };
  return (
    <div className="fixed inset-0 z-[85] bg-bg anim-fade overflow-y-auto" role="dialog" aria-modal="true" aria-label="Search">
      <div className="gutter max-w-3xl mx-auto pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-10">
        <form onSubmit={(e) => { e.preventDefault(); submit(q); }} className="flex items-center gap-2 border-b-2 border-fg pb-2">
          <Search size={22} className="text-muted shrink-0" />
          <label htmlFor="search-q" className="sr-only">Search the collection</label>
          <input id="search-q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blazers, sarees, occasions…" className="flex-1 bg-transparent text-[20px] lg:text-[28px] font-serif outline-none py-2 min-w-0" autoComplete="off" enterKeyHint="search" />
          <button type="button" onClick={onClose} className="h-11 w-11 grid place-items-center rounded-full hover:bg-tint" aria-label="Close search"><X size={22} /></button>
        </form>
        {!terms.length ? (
          <div className="mt-8 space-y-8">
            <div><p className="eyebrow text-muted mb-3">Popular on campus</p><div className="flex flex-wrap gap-2">{suggestions.map((s) => <button key={s} onClick={() => submit(s)} className="h-10 px-4 rounded-full border border-line hover:border-fg/40 text-sm font-semibold">{s}</button>)}</div></div>
            <div><p className="eyebrow text-muted mb-3">Shop by occasion</p><div className="grid grid-cols-2 gap-2">{OCCASIONS.map((o) => <a key={o.id} href={`#occasion-${o.id}`} onClick={onClose} className="rounded-xl bg-tint px-4 py-3 text-sm font-semibold hover:bg-sage/40">{o.label}</a>)}</div></div>
          </div>
        ) : (
          <div className="mt-6">
            {results.length ? (
              <ul className="divide-y divide-line">
                {results.map((p) => (
                  <li key={p.id}><a href={`#product-${p.id}`} onClick={onClose} className="flex items-center gap-4 py-3 hover:bg-tint/60 rounded-lg px-2">
                    <span className="h-16 w-12 rounded-lg overflow-hidden shrink-0"><ProductImage p={p} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold truncate">{p.name}</span><span className="text-sm text-muted">{p.category} · {p.color}</span></span>
                    <span className="font-bold tnum">₹{p.rentalPrice}</span>
                  </a></li>
                ))}
              </ul>
            ) : <p className="text-muted py-6">No garments match “{q}”. Try a colour, garment or occasion.</p>}
            {results.length > 0 && <button onClick={() => submit(q)} className="mt-4 inline-flex items-center gap-2 font-semibold text-brand">See all results <ArrowRight size={16} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, href, children, count }: { label: string; onClick?: () => void; href?: string; children: ReactNode; count?: number }) {
  const cls = 'relative h-11 w-11 grid place-items-center rounded-full hover:bg-tint transition';
  const badge = count ? <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-terra text-white text-[10px] font-bold grid place-items-center tnum">{count}</span> : null;
  return href
    ? <a href={href} aria-label={label + (count ? `, ${count} items` : '')} className={cls}>{children}{badge}</a>
    : <button type="button" onClick={onClick} aria-label={label} className={cls}>{children}{badge}</button>;
}

export function Header() {
  const { route } = useRouter();
  const { state, online } = useStore();
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pwa = usePWA();
  useEffect(() => { const on = () => setScrolled(window.scrollY > 8); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  const active = (to: string) => route.page === to || (to === 'popups' && route.page === 'popup') || (to === 'explore' && ['occasion', 'style', 'search'].includes(route.page));
  return (
    <>
      <div className="bg-forest-deep text-ivory text-[12px] font-semibold">
        <div className="gutter max-w-[1440px] mx-auto h-9 flex items-center justify-center lg:justify-between gap-4">
          <span className="hidden lg:inline text-ivory/70">CHRIST University, Central Campus pilot · Bengaluru</span>
          <span>Campus-ready fashion starting at <span className="text-gold">₹299</span>.</span>
          <span className="hidden lg:flex items-center gap-4 text-ivory/80">
            {pwa.canInstall && <button onClick={pwa.install} className="inline-flex items-center gap-1 hover:text-white"><Download size={13} />Install app</button>}
            <a href="#demo" className="hover:text-white">Demo mode</a><a href="#help" className="hover:text-white">Help</a>
          </span>
        </div>
      </div>
      {!online && <div className="bg-terra text-white text-[13px] font-semibold"><div className="gutter max-w-[1440px] mx-auto py-2 flex items-center gap-2"><WifiOff size={15} />You are offline. You can browse saved pages, but reservations are paused until you reconnect.</div></div>}
      <header className={cx('sticky z-50 bg-bg/95 backdrop-blur border-b transition-colors', scrolled ? 'border-line' : 'border-transparent')} style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="gutter max-w-[1440px] mx-auto h-[60px] lg:h-[72px] flex items-center gap-6">
          <a href="#home" aria-label="ReWear Campus home" className="shrink-0"><Logo /></a>
          <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.to} href={`#${n.to}`} aria-current={active(n.to) ? 'page' : undefined} className={cx('px-3 py-2 text-[14px] font-semibold rounded-full transition relative', active(n.to) ? 'text-brand' : 'text-fg/80 hover:text-fg')}>
                {n.label}{active(n.to) && <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-gold rounded" />}
              </a>
            ))}
          </nav>
          <div className="flex items-center ml-auto lg:ml-0 -mr-2">
            <IconBtn label="Search" onClick={() => setSearch(true)}><Search size={21} /></IconBtn>
            <IconBtn label="Wishlist" href="#wishlist" count={state.wishlist.length || undefined}><Heart size={21} /></IconBtn>
            <IconBtn label="Rental bag" href="#bag" count={state.bag.length || undefined}><ShoppingBag size={21} /></IconBtn>
            <span className="hidden lg:block"><IconBtn label="Profile" href="#profile"><User size={21} /></IconBtn></span>
          </div>
        </div>
      </header>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

export function BottomNav() {
  const { route } = useRouter();
  const items = [
    { to: 'home', label: 'Home', icon: Home, match: ['home'] },
    { to: 'explore', label: 'Explore', icon: LayoutGrid, match: ['explore', 'formal', 'ethnic', 'occasion', 'style', 'search', 'product'] },
    { to: 'pass', label: 'ReWear Pass', icon: Ticket, match: ['pass'] },
    { to: 'wardrobe', label: 'My Rentals', icon: Shirt, match: ['wardrobe', 'confirmation'] },
    { to: 'profile', label: 'Profile', icon: User, match: ['profile', 'wishlist', 'demo', 'feedback'] },
  ];
  return (
    <nav aria-label="App" className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <ul className="grid grid-cols-5 h-[64px]">
        {items.map(({ to, label, icon: Icon, match }) => {
          const on = match.includes(route.page);
          return (
            <li key={to}><a href={`#${to}`} aria-current={on ? 'page' : undefined} className={cx('h-full flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition', on ? 'text-brand' : 'text-muted')}>
              <span className={cx('h-7 w-12 grid place-items-center rounded-full transition', on && 'bg-tint')}><Icon size={20} strokeWidth={on ? 2.3 : 1.8} /></span>{label}
            </a></li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer() {
  const cols = [
    { h: 'ReWear', l: [['About Us', 'story'], ['Our Story', 'story'], ['Sustainability', 'sustainability'], ['Campus Pop-Ups', 'popups'], ['Share feedback', 'feedback']] },
    { h: 'Policies', l: [['Rental Policy', 'policy-rental'], ['Subscription Policy', 'policy-subscription'], ['Cancellation Policy', 'policy-cancellation'], ['Privacy Policy', 'policy-privacy']] },
    { h: 'Support', l: [['Help Centre', 'help'], ['Contact', 'help'], ['Find My Fit', 'fit'], ['Demo mode', 'demo'], ['Demo Admin', 'admin'], ['Photo credits', 'credits']] },
  ];
  return (
    <footer className="bg-forest-deep text-ivory mt-20 pb-[calc(80px+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <div className="gutter max-w-[1440px] mx-auto py-14 grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo light />
          <p className="font-serif text-[26px] leading-tight mt-6">Repeat the style. <span className="italic text-gold">Not the spend.</span></p>
          <p className="text-ivory/65 text-sm mt-3">A student venture piloting formal and ethnic wear rentals for CHRIST University, Central Campus, Bengaluru. Independent of the university; not an official university service.</p>
          <div className="flex gap-2 mt-5">
            {[[Instagram, 'Instagram'], [Linkedin, 'LinkedIn'], [Youtube, 'YouTube'], [Mail, 'Email']].map(([I, l]) => { const Icon = I as typeof Mail; return <a key={l as string} href="#help" aria-label={`${l} (handle to be announced)`} className="h-10 w-10 rounded-full border border-ivory/20 grid place-items-center hover:border-gold hover:text-gold"><Icon size={17} /></a>; })}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}><p className="eyebrow text-gold mb-4">{c.h}</p><ul className="space-y-2.5">{c.l.map(([t, to]) => <li key={t}><a href={`#${to}`} className="text-ivory/80 hover:text-white text-[14px]">{t}</a></li>)}</ul></div>
        ))}
      </div>
      <div className="border-t border-ivory/10">
        <div className="gutter max-w-[1440px] mx-auto py-5 flex flex-col lg:flex-row gap-2 justify-between text-[12px] text-ivory/55">
          <span>© {new Date().getFullYear()} ReWear Campus. Prototype for an entrepreneurship project.</span>
          <span>Prices are proposed pilot prices. Payments, bookings and locations shown here are simulated.</span>
        </div>
      </div>
    </footer>
  );
}
