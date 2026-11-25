import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../data/types';
import { GarmentArt } from './GarmentArt';
import { useStore } from '../store/store';
import { availabilityLabel } from '../store/rules';
import { cx, inr } from '../lib/util';
import { useToast } from './ui';
import { authorUrl, photoFor, photoSrc, photoSrcSet, unsplashUrl, type Photo } from '../data/photos';

/** Responsive photograph with a placeholder colour while loading; renders `fallback` if the image fails. */
export function PhotoImg({ photo, sizes, className, alt, position = '50% 25%', zoom, eager, fallback }: { photo: Photo; sizes: string; className?: string; alt?: string; position?: string; zoom?: number; eager?: boolean; fallback?: React.ReactNode }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return <>{fallback ?? null}</>;
  return (
    <img
      src={photoSrc(photo, 1200)}
      srcSet={photoSrcSet(photo)}
      sizes={sizes}
      alt={alt ?? photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setBroken(true)}
      className={cx('w-full h-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
      style={{ objectPosition: position, background: photo.color ?? undefined, transform: zoom ? `scale(${zoom})` : undefined, transformOrigin: position }}
    />
  );
}

/** A custom photo URL if an admin set one, else the Unsplash photograph, else the studio rendering. */
export function ProductImage({ p, view = 'front', className, sizes = '(min-width: 1024px) 25vw, 50vw', eager }: { p: Product; view?: 'front' | 'detail' | 'swatch'; className?: string; sizes?: string; eager?: boolean }) {
  const [broken, setBroken] = useState(false);
  const art = <GarmentArt kind={p.art} color={p.hex} accent={p.accent} seed={p.id} view={view} title={`${p.name} in ${p.color}`} className={cx('w-full h-full block', className)} />;
  if (view === 'swatch') return art;
  if (p.imageUrl && !broken) {
    return <img src={p.imageUrl} alt={p.name} loading="lazy" onError={() => setBroken(true)} className={cx('object-cover w-full h-full', className)} style={view === 'detail' ? { transform: 'scale(1.9)', transformOrigin: '50% 35%' } : undefined} />;
  }
  const photo = photoFor(p.id);
  if (photo) {
    return (
      <div className="relative w-full h-full overflow-hidden" style={{ background: photo.color ?? undefined }}>
        <PhotoImg photo={photo} sizes={sizes} alt={`${p.name}, ${p.color}`} className={className} eager={eager} zoom={view === 'detail' ? 1.9 : undefined} position={view === 'detail' ? '50% 38%' : '50% 22%'} fallback={<GarmentArt kind={p.art} color={p.hex} accent={p.accent} seed={p.id} view={view} className="w-full h-full block" />} />
      </div>
    );
  }
  return art;
}

/** Photographer credit, as the Unsplash guidelines ask. */
export function PhotoCredit({ id, className }: { id: string; className?: string }) {
  const photo = photoFor(id);
  if (!photo) return null;
  return <p className={cx('text-[11px] text-muted', className)}>Photo by <a href={authorUrl(photo)} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">{photo.author}</a> on <a href={unsplashUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">Unsplash</a></p>;
}

export function WishButton({ id, className }: { id: string; className?: string }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const on = state.wishlist.includes(id);
  return (
    <button
      type="button"
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); const r = actions.toggleWishlist(id); if (r.ok) toast('ok', r.value ? 'Saved to your wishlist' : 'Removed from your wishlist'); }}
      className={cx('h-10 w-10 grid place-items-center rounded-full bg-white/85 backdrop-blur text-ink hover:bg-white transition', className)}
    >
      <Heart size={18} className={on ? 'fill-terra text-terra' : ''} />
    </button>
  );
}

export function ProductCard({ p, compact, className }: { p: Product; compact?: boolean; className?: string }) {
  const { state } = useStore();
  const avail = availabilityLabel(state, p);
  const saving = Math.round((1 - p.rentalPrice / p.retailPrice) * 100);
  return (
    <article className={cx('group relative flex flex-col min-w-0', className)}>
      <a href={`#product-${p.id}`} className="block relative overflow-hidden rounded-xl bg-tint aspect-[3/4]" aria-label={`${p.name}, ${inr(p.rentalPrice)} rental`}>
        <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.03]"><ProductImage p={p} /></div>
        <div className="absolute left-2 top-2 flex flex-col gap-1 items-start">
          {p.tier === 'premium' && <span className="rounded-full bg-forest-deep/90 text-gold text-[10px] font-bold tracking-[0.14em] px-2 py-1">PREMIUM</span>}
          <span className="rounded-full bg-white/85 text-ink text-[10px] font-bold px-2 py-1">{saving}% below retail</span>
        </div>
      </a>
      <WishButton id={p.id} className="absolute right-2 top-2" />
      <div className="pt-3 flex flex-col gap-1 flex-1">
        <p className="text-[11px] text-muted font-semibold uppercase tracking-[0.12em]">{p.gender === 'men' ? 'Men' : 'Women'} · {p.category}</p>
        <a href={`#product-${p.id}`} className="font-semibold leading-snug text-[14.5px] hover:underline underline-offset-4 line-clamp-2">{p.name}</a>
        <p className="flex items-baseline gap-2 tnum">
          <span className="font-bold text-[16px]">{inr(p.rentalPrice)}</span>
          <span className="text-[12px] text-muted">/ 48 hrs</span>
          <span className="text-[12px] text-muted line-through ml-auto" aria-label={`Estimated retail ${inr(p.retailPrice)}`}>{inr(p.retailPrice)}</span>
        </p>
        {!compact && <p className="text-[12px] text-muted truncate">Sizes {p.sizes.map((s) => s.replace('Blouse ', '')).join(' · ')}</p>}
        <p className={cx('text-[12px] font-semibold flex items-center gap-1.5', avail.tone === 'ok' ? 'text-brand' : avail.tone === 'low' ? 'text-[#a46b12]' : 'text-terra')}>
          <span className={cx('h-1.5 w-1.5 rounded-full', avail.tone === 'ok' ? 'bg-brand' : avail.tone === 'low' ? 'bg-[#d39a2d]' : 'bg-terra')} />{avail.label}
        </p>
        <a href={`#product-${p.id}`} className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-fg/20 text-[13px] font-semibold hover:bg-brand hover:text-onbrand hover:border-brand transition">Rent now</a>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton rounded-xl aspect-[3/4]" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
    </div>
  );
}
