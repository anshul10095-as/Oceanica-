// Generates PWA icons from the ReWear monogram (hanger inside a reuse loop).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
mkdirSync('public/icons', { recursive: true });
const mark = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-24 -24)">
    <path d="M40.5 17.5 A18 18 0 1 0 41.6 29" fill="none" stroke="#FAF8F2" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M37.2 14.6 L41 18.4 L44.6 14.3" fill="none" stroke="#D4B477" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 14.2 c0-2.2 1.6-3.4 3.2-3.4 c1.7 0 3 1.3 3 2.9 c0 1.7-1.4 2.6-3 3.4 L24 18.6 L11.8 28.4 c-.9.8-.4 2 .8 2 h22.8 c1.2 0 1.7-1.2.8-2 L24 18.6" fill="none" stroke="#FAF8F2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
const svg = (scale, rounded) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="#164B35"/>${mark(scale)}</svg>`);
await sharp(svg(7.4, true)).resize(512, 512).png().toFile('public/icons/icon-512.png');
await sharp(svg(7.4, true)).resize(192, 192).png().toFile('public/icons/icon-192.png');
await sharp(svg(5.6, false)).resize(512, 512).png().toFile('public/icons/maskable-512.png');
await sharp(svg(6.6, false)).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
console.log('icons written');
