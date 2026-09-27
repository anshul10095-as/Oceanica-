import { existsSync, readdirSync } from 'node:fs';

export const PENDING = [];
let currentPage = '';
export const setPage = (p) => { currentPage = p; };

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const isPending = (v) => v && typeof v === 'object' && 'pending' in v;

// Plain text for attributes and metadata; pending slots collapse to ''.
export const plain = (v) => (isPending(v) ? '' : String(v ?? ''));

// Inline value: text, or a pending marker.
export function t(v) {
  if (isPending(v)) {
    PENDING.push({ page: currentPage, label: v.pending, hint: v.hint });
    return `<span class="pending" title="${esc(v.hint)}">${esc(v.pending)}</span>`;
  }
  return esc(v);
}

// Block value(s): each paragraph wrapped in <p>, pending shown as a quiet placeholder block.
export function paras(list, cls = '') {
  const arr = Array.isArray(list) ? list : [list];
  return arr
    .map((v) => {
      if (isPending(v)) {
        PENDING.push({ page: currentPage, label: v.pending, hint: v.hint });
        return `<p class="pending-block${cls ? ' ' + cls : ''}"><span class="pending-block__tag">Approved copy pending</span>${esc(v.pending)}${v.hint ? `<span class="pending-block__hint">${esc(v.hint)}</span>` : ''}</p>`;
      }
      return `<p${cls ? ` class="${cls}"` : ''}>${esc(v)}</p>`;
    })
    .join('\n');
}

export const hasContent = (list) => (Array.isArray(list) ? list : [list]).some((v) => v && !isPending(v));

// ── Responsive images ─────────────────────────────────────────────────────────
const IMG_DIR = 'public/assets/img';
const available = existsSync(IMG_DIR) ? readdirSync(IMG_DIR) : [];

function widthsFor(name) {
  const re = new RegExp(`^${name}-(\\d+)\\.jpg$`);
  return available.map((f) => f.match(re)).filter(Boolean).map((m) => +m[1]).sort((a, b) => a - b);
}

/**
 * <picture> with AVIF / WebP / JPEG sources.
 * Missing assets render an honest, labelled placeholder so layouts never break.
 */
export function pic(name, { alt = '', sizes = '100vw', eager = false, cls = '', placeholder = 'Image to be supplied' } = {}) {
  const widths = name ? widthsFor(name) : [];
  if (!widths.length) {
    return `<div class="img-placeholder ${cls}" role="img" aria-label="${esc(placeholder)}"><span>${esc(placeholder)}</span></div>`;
  }
  const set = (ext) => widths.map((w) => `/assets/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallback = `/assets/img/${name}-${widths[Math.min(1, widths.length - 1)]}.jpg`;
  return `<picture class="${cls}">
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="${fallback}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1600" height="900">
  </picture>`;
}

export const imgUrl = (name, w = 1600) => {
  const ws = widthsFor(name);
  if (!ws.length) return '';
  const pick = ws.find((x) => x >= w) || ws[ws.length - 1];
  return `/assets/img/${name}-${pick}.jpg`;
};

export const arrow = `<svg class="icon-arrow" viewBox="0 0 28 10" aria-hidden="true"><path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
export const arrowDown = `<svg class="icon-arrow-down" viewBox="0 0 10 28" aria-hidden="true"><path d="M5 0v26M1 22l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
export const plus = `<svg class="icon-plus" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0v14M0 7h14" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;

export const linkCta = (href, label, cls = '') =>
  `<a class="cta ${cls}" href="${href}"><span class="cta__label">${esc(label)}</span><span class="cta__line" aria-hidden="true"></span>${arrow}</a>`;

export const label = (text, num) =>
  `<p class="eyebrow">${num ? `<span class="eyebrow__num">${esc(num)}</span>` : ''}${esc(text)}</p>`;

// Serif multi-line statement with per-line masked reveal.
export const lines = (arr, tag = 'h2', cls = 'display') =>
  `<${tag} class="${cls}">${(Array.isArray(arr) ? arr : [arr])
    .map((l, i) => `<span class="line"><span class="line__inner" style="--i:${i}">${esc(l)}</span></span>`)
    .join(' ')}</${tag}>`;
