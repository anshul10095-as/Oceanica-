import { cx } from '../lib/util';

/** Monogram: a hanger held inside an open reuse loop that ends in an arrowhead. */
export function Mark({ size = 34, className, tone = 'currentColor', accent = '#D4B477' }: { size?: number; className?: string; tone?: string; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M40.5 17.5 A18 18 0 1 0 41.6 29" fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M37.2 14.6 L41 18.4 L44.6 14.3" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 14.2 c0-2.2 1.6-3.4 3.2-3.4 c1.7 0 3 1.3 3 2.9 c0 1.7-1.4 2.6-3 3.4 L24 18.6 L11.8 28.4 c-.9.8-.4 2 .8 2 h22.8 c1.2 0 1.7-1.2.8-2 L24 18.6" fill="none" stroke={tone} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <Mark size={34} tone={light ? '#FAF8F2' : 'rgb(var(--brand))'} />
      <span className="leading-none">
        <span className={cx('block font-serif text-[23px] font-semibold tracking-[-0.01em]', light ? 'text-ivory' : 'text-fg')}>Re<span className="italic">Wear</span></span>
        <span className={cx('block text-[8.5px] font-bold tracking-[0.42em] mt-0.5', light ? 'text-gold' : 'text-brand')}>CAMPUS</span>
      </span>
    </span>
  );
}
