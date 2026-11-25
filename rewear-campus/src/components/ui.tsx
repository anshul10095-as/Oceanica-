import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cx } from '../lib/util';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'light';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-onbrand hover:opacity-90',
  secondary: 'border border-fg/20 text-fg hover:border-fg/60 bg-transparent',
  ghost: 'text-fg hover:bg-tint',
  gold: 'bg-gold text-forest-deep hover:brightness-105',
  danger: 'border border-terra/60 text-terra hover:bg-terra/10',
  light: 'bg-ivory text-forest-deep hover:bg-white',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      className={cx('inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] select-none',
        size === 'sm' ? 'h-9 px-4 text-[13px]' : size === 'lg' ? 'h-[52px] px-7 text-[15px]' : 'h-11 px-5 text-sm', VARIANTS[variant], className)}
      {...rest}
    >{children}</button>
  );
}

export function LinkButton({ href, variant = 'primary', size = 'md', className, children }: { href: string; variant?: Variant; size?: 'sm' | 'md' | 'lg'; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={cx('inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98]',
      size === 'sm' ? 'h-9 px-4 text-[13px]' : size === 'lg' ? 'h-[52px] px-7 text-[15px]' : 'h-11 px-5 text-sm', VARIANTS[variant], className)}>{children}</a>
  );
}

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'gold' | 'brand' | 'demo'; children: ReactNode; className?: string }) {
  const t = {
    neutral: 'bg-tint text-fg/80',
    ok: 'bg-[#dcebdc] text-[#1f5a35] dark:bg-[#1f3a2a] dark:text-[#bfe0c6]',
    warn: 'bg-[#f6ead2] text-[#7a5514]',
    bad: 'bg-[#f6ddd3] text-[#8d3b1f]',
    gold: 'bg-gold/25 text-[#6d5522] dark:text-gold',
    brand: 'bg-brand text-onbrand',
    demo: 'border border-dashed border-terra/70 text-terra bg-transparent',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap', t, className)}>{children}</span>;
}

export function SectionHead({ eyebrow, title, action, sub, className }: { eyebrow?: string; title: ReactNode; action?: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-end justify-between gap-4 mb-5 lg:mb-7', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow text-brand mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-[30px] leading-[1.05] lg:text-[44px] font-semibold">{title}</h2>
        {sub && <p className="mt-2 text-muted max-w-[60ch] text-[15px]">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 rounded-2xl border border-dashed border-line">
      <div className="h-14 w-14 rounded-full bg-tint grid place-items-center text-brand mb-4">{icon}</div>
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      <p className="text-muted mt-1 max-w-sm text-sm">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cx('skeleton rounded-xl', className)} />;

export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('flex items-start gap-2 text-[12px] text-muted', className)}><Info size={14} className="mt-[2px] shrink-0 text-terra" /><span>{children}</span></p>;
}

// ---------- Modal / bottom sheet ----------
export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    setTimeout(() => ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus(), 30);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center anim-fade" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0c1410]/55" onClick={onClose} />
      <div ref={ref} className={cx('relative w-full bg-surface text-fg rounded-t-[22px] md:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col anim-sheet md:anim-rise', wide ? 'md:max-w-3xl' : 'md:max-w-lg')} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-1.5 h-1 w-10 rounded-full bg-line" />
          <h2 className="font-serif text-[22px] font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="h-10 w-10 -mr-2 grid place-items-center rounded-full hover:bg-tint"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-line">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Toasts ----------
interface Toast { id: number; kind: 'ok' | 'err' | 'info'; text: string }
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x.slice(-2), { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), kind === 'err' ? 5200 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-[90] left-1/2 -translate-x-1/2 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] lg:bottom-6 flex flex-col gap-2 w-[min(92vw,420px)]" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx('anim-rise flex items-start gap-3 rounded-xl px-4 py-3 shadow-lift text-sm font-medium', t.kind === 'err' ? 'bg-[#5b2416] text-[#fde9e1]' : 'bg-forest-deep text-ivory')}>
            {t.kind === 'ok' ? <CheckCircle2 size={18} className="text-sage shrink-0 mt-px" /> : t.kind === 'err' ? <AlertCircle size={18} className="shrink-0 mt-px" /> : <Info size={18} className="text-gold shrink-0 mt-px" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="block text-[13px] font-semibold mb-1.5">{label}</span>
      {children}
      {error ? <span className="block text-[12px] text-terra mt-1">{error}</span> : hint ? <span className="block text-[12px] text-muted mt-1">{hint}</span> : null}
    </label>
  );
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cx('h-10 px-4 rounded-full border text-[13px] font-semibold whitespace-nowrap transition', active ? 'bg-brand text-onbrand border-brand' : 'border-line bg-surface hover:border-fg/40', className)}>{children}</button>
  );
}

export function Stat({ label, value, sub, className }: { label: string; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-surface p-4', className)}>
      <p className="text-[12px] text-muted font-semibold">{label}</p>
      <p className="font-serif text-[30px] leading-tight font-semibold tnum mt-1">{value}</p>
      {sub && <p className="text-[12px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
