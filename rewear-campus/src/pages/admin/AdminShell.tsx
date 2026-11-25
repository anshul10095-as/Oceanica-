import { useState, type ReactNode } from 'react';
import { LayoutDashboard, Shirt, ClipboardList, Ticket, Store, Wrench, BarChart3, MessageSquare, Settings, ArrowLeft, Menu, X, RotateCcw } from 'lucide-react';
import { useRouter } from '../../lib/router';
import { useStore } from '../../store/store';
import { Mark } from '../../components/Brand';
import { cx } from '../../lib/util';
import Overview from './Overview';
import Inventory from './Inventory';
import Rentals from './Rentals';
import { Members, PopupAdmin, Maintenance, SettingsPage } from './Operations';
import { Analytics, FeedbackAdmin } from './Analytics';

const SECTIONS = [
  { id: '', label: 'Overview', icon: LayoutDashboard, C: Overview },
  { id: 'rentals', label: 'Rentals', icon: ClipboardList, C: Rentals },
  { id: 'inventory', label: 'Inventory', icon: Shirt, C: Inventory },
  { id: 'maintenance', label: 'Cleaning & repair', icon: Wrench, C: Maintenance },
  { id: 'members', label: 'Subscriptions', icon: Ticket, C: Members },
  { id: 'popups', label: 'Pop-ups', icon: Store, C: PopupAdmin },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, C: Analytics },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, C: FeedbackAdmin },
  { id: 'settings', label: 'Policies & pricing', icon: Settings, C: SettingsPage },
];

export function AdminPanel({ title, sub, actions, children }: { title: string; sub?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div><h1 className="text-[26px] lg:text-[30px] font-bold tracking-tight">{title}</h1>{sub && <p className="text-muted text-[14px] mt-1 max-w-[70ch]">{sub}</p>}</div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export default function AdminShell() {
  const { route } = useRouter();
  const { state, actions } = useStore();
  const [nav, setNav] = useState(false);
  const section = SECTIONS.find((s) => s.id === route.arg) ?? SECTIONS[0];
  const C = section.C;
  const pending = state.bookings.filter((b) => b.extension?.status === 'requested' || b.cancellationRequested).length;
  const side = (
    <nav className="flex flex-col h-full" aria-label="Admin">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-ivory/10"><Mark size={30} tone="#FAF8F2" /><div><p className="font-bold text-[15px] leading-none">ReWear Ops</p><p className="text-[10px] tracking-[0.2em] text-gold font-bold mt-1">DEMO ADMIN</p></div></div>
      <ul className="p-3 space-y-0.5 flex-1 overflow-y-auto">
        {SECTIONS.map(({ id, label, icon: I }) => (
          <li key={id}><a href={`#admin${id ? '-' + id : ''}`} onClick={() => setNav(false)} aria-current={section.id === id ? 'page' : undefined} className={cx('flex items-center gap-3 h-11 px-3 rounded-lg text-[14px] font-semibold transition', section.id === id ? 'bg-ivory/10 text-white' : 'text-ivory/65 hover:text-white hover:bg-ivory/5')}>
            <I size={18} />{label}{id === 'rentals' && pending > 0 && <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-terra text-[11px] grid place-items-center tnum">{pending}</span>}
          </a></li>
        ))}
      </ul>
      <div className="p-3 border-t border-ivory/10 space-y-1">
        <a href="#home" onClick={() => actions.setRole('student')} className="flex items-center gap-3 h-11 px-3 rounded-lg text-[14px] font-semibold text-ivory/70 hover:text-white"><ArrowLeft size={18} />Back to storefront</a>
        <a href="#demo" className="flex items-center gap-3 h-11 px-3 rounded-lg text-[14px] font-semibold text-ivory/70 hover:text-white"><RotateCcw size={18} />Demo mode and reset</a>
      </div>
    </nav>
  );
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:block bg-[#121A16] text-ivory sticky top-0 h-screen">{side}</aside>
      <div className="lg:hidden sticky z-40 bg-[#121A16] text-ivory flex items-center gap-3 gutter h-14" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <button onClick={() => setNav(true)} aria-label="Open admin menu" className="h-10 w-10 -ml-2 grid place-items-center"><Menu size={22} /></button>
        <p className="font-bold">{section.label}</p><span className="ml-auto text-[10px] tracking-[0.2em] text-gold font-bold">DEMO ADMIN</span>
      </div>
      {nav && <div className="lg:hidden fixed inset-0 z-[70]"><div className="absolute inset-0 bg-black/50" onClick={() => setNav(false)} /><div className="absolute inset-y-0 left-0 w-[270px] bg-[#121A16] text-ivory anim-fade"><button onClick={() => setNav(false)} className="absolute right-2 top-4 h-10 w-10 grid place-items-center" aria-label="Close menu"><X size={20} /></button>{side}</div></div>}
      <main className="gutter py-6 lg:py-8 min-w-0 max-w-[1400px] w-full">
        <div className="mb-5 rounded-lg border border-dashed border-terra/60 px-3 py-2 text-[12px] text-terra font-semibold">Demonstration environment. Records marked “demo” are seeded examples; everything else was created in this browser session. No real payments are processed.</div>
        <C />
      </main>
    </div>
  );
}
