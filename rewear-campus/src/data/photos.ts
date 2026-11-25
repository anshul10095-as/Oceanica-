// Product and editorial photography from Unsplash (Unsplash License: free to use, attribution given).
// Photos are hotlinked from Unsplash's image CDN, as the Unsplash API guidelines require, and served
// responsively: phones get ~640–1280px, large and high-density screens up to 3840px (4K) where the
// original is that large.
import data from './photos.json';

export interface Photo { id: string; raw: string; w: number; h: number; alt: string; color: string | null; author: string; username: string; page: string }

const PHOTOS = data as Record<string, Photo>;
const WIDTHS = [480, 800, 1200, 1600, 2400, 3200, 3840];
const UTM = 'utm_source=rewear_campus&utm_medium=referral';

export const photoFor = (key: string): Photo | undefined => PHOTOS[key];
export const allPhotos = () => Object.entries(PHOTOS);

export function photoSrc(p: Photo, w: number, q = 78) {
  return `${p.raw}&w=${Math.min(w, p.w)}&q=${q}&fit=max&auto=format`;
}

export function photoSrcSet(p: Photo) {
  const ws = WIDTHS.filter((w) => w <= p.w);
  if (!ws.length || ws[ws.length - 1] < p.w) ws.push(p.w);
  return ws.map((w) => `${photoSrc(p, w)} ${w}w`).join(', ');
}

export const authorUrl = (p: Photo) => `https://unsplash.com/@${p.username}?${UTM}`;
export const photoPage = (p: Photo) => `${p.page}?${UTM}`;
export const unsplashUrl = `https://unsplash.com/?${UTM}`;
