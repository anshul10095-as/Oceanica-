// Regenerates every optimised media derivative in public/assets from assets-source/.
// Replace a source file (same name) and re-run `npm run assets` to update the site.
//
//   assets-source/video/hero.mp4                   -> hero video (1080p + 720p) and poster stills
//   assets-source/images/*.{webp,jpg,png}          -> responsive AVIF / WebP / JPEG sets
//   assets-source/brand/oceanica-wordmark.webp     -> logo (transparent PNG + WebP)
//   assets-source/brand/oceanica-emblem.webp       -> favicons, app icons, social image
//   assets-source/leadership/<slug>.{jpg,png,webp} -> leadership portraits (4:5, muted)
//   assets-source/projects/<slug>.{jpg,png,webp}   -> project imagery

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const SRC = 'assets-source';
const OUT = 'public/assets';
const WIDTHS = [640, 1024, 1600, 2400];

const mk = (d) => mkdirSync(d, { recursive: true });
const run = (args) => execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

// Stills pulled from the supplied hero film, used as curated editorial imagery.
// [output name, timestamp in seconds]
const FILM_STILLS = [
  ['film-water-wall', 2.5],
  ['film-water-detail', 3.5],
  ['film-colonnade', 4.5],
  ['film-garden-fountain', 6.5],
  ['film-sculpture', 7.5],
  ['film-fountain-plan', 9.5],
  ['film-garden-hedge', 11.5],
];

async function responsive(input, name, { widths = WIDTHS, crop, modulate } = {}) {
  mk(`${OUT}/img`);
  const meta = await sharp(input).metadata();
  for (const w of widths) {
    if (w > meta.width * 1.25) continue;
    let img = sharp(input);
    if (crop) img = img.resize({ width: w, height: Math.round(w / crop), fit: 'cover', position: 'attention' });
    else img = img.resize({ width: w, withoutEnlargement: true });
    if (modulate) img = img.modulate(modulate);
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/img/${name}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/img/${name}-${w}.webp`);
    await img.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}/img/${name}-${w}.jpg`);
  }
}

async function video() {
  const src = `${SRC}/video/hero.mp4`;
  if (!existsSync(src)) return console.warn('! no hero video found, skipping');
  mk(`${OUT}/video`);
  // A short fade in and out to Oceanica Midnight softens the loop point.
  const fade = 'fade=t=in:st=0:d=0.8:color=0x061C29,fade=t=out:st=12.5:d=0.8:color=0x061C29';
  for (const [h, crf] of [[1080, 27], [720, 28]]) {
    run(['-i', src, '-an', '-vf', `fps=30,scale=-2:${h}:flags=lanczos,${fade}`, '-c:v', 'libx264',
      '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', `${OUT}/video/hero-${h}.mp4`]);
    // VP9 WebM: smaller where supported, and plays in Chromium builds without H.264.
    run(['-i', src, '-an', '-vf', `fps=30,scale=-2:${h}:flags=lanczos,${fade}`, '-c:v', 'libvpx-vp9',
      '-b:v', h === 1080 ? '2400k' : '1300k', '-maxrate', h === 1080 ? '2400k' : '1300k', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
      `${OUT}/video/hero-${h}.webm`]);
  }
  const tmp = 'assets-source/.stills';
  mk(tmp);
  for (const [name, t] of [['hero-poster', 2.5], ...FILM_STILLS]) {
    run(['-ss', String(t), '-i', src, '-frames:v', '1', '-q:v', '1', `${tmp}/${name}.png`]);
    await responsive(`${tmp}/${name}.png`, name, { widths: [640, 1024, 1600, 1920] });
  }
  rmSync(tmp, { recursive: true, force: true });
}

async function images() {
  for (const f of readdirSync(`${SRC}/images`)) {
    if (!/\.(webp|jpe?g|png|avif)$/i.test(f)) continue;
    await responsive(`${SRC}/images/${f}`, basename(f, extname(f)));
  }
  for (const dir of ['projects', 'leadership']) {
    if (!existsSync(`${SRC}/${dir}`)) continue;
    for (const f of readdirSync(`${SRC}/${dir}`)) {
      if (!/\.(webp|jpe?g|png|avif)$/i.test(f)) continue;
      const name = `${dir}-${basename(f, extname(f))}`;
      if (dir === 'leadership') {
        // Consistent 4:5 portraits with a restrained, slightly desaturated grade.
        await responsive(`${SRC}/${dir}/${f}`, name, { widths: [480, 800, 1200], crop: 4 / 5, modulate: { saturation: 0.35 } });
      } else {
        await responsive(`${SRC}/${dir}/${f}`, name);
      }
    }
  }
}

async function brand() {
  mk(`${OUT}/brand`);
  const word = sharp(`${SRC}/brand/oceanica-wordmark.webp`).trim({ threshold: 1 });
  const buf = await word.png().toBuffer();
  for (const w of [360, 720]) {
    await sharp(buf).resize({ width: w }).png({ compressionLevel: 9, palette: false }).toFile(`${OUT}/brand/oceanica-wordmark-${w}.png`);
    await sharp(buf).resize({ width: w }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/brand/oceanica-wordmark-${w}.webp`);
  }

  // The emblem arrives on a baked-in checkerboard: keep only the circular seal for icons.
  const em = sharp(`${SRC}/brand/oceanica-emblem.webp`);
  const { width } = await em.metadata();
  const cx = Math.round(width * 0.4713), cy = Math.round(width * 0.413), r = Math.round(width * 0.346);
  const disc = Buffer.from(`<svg width="${r * 2}" height="${r * 2}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`);
  const seal = await em.extract({ left: cx - r, top: cy - r, width: r * 2, height: r * 2 })
    .composite([{ input: disc, blend: 'dest-in' }]).png().toBuffer();
  for (const s of [32, 180, 192, 512]) {
    await sharp(seal).resize(s, s).png().toFile(`public/${s === 180 ? 'apple-touch-icon' : `icon-${s}`}.png`);
  }
  await sharp(seal).resize(48, 48).png().toFile('public/favicon.png');

  // Open Graph card: wordmark centred on Oceanica Midnight.
  const og = await sharp(buf).resize({ width: 760 }).toBuffer();
  const ogMeta = await sharp(og).metadata();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#061C29' } })
    .composite([{ input: og, left: 220, top: Math.round((630 - ogMeta.height) / 2) }])
    .jpeg({ quality: 86 }).toFile(`${OUT}/brand/og-image.jpg`);
}

const only = process.argv[2];
if (!only || only === 'brand') await brand();
if (!only || only === 'images') await images();
if (!only || only === 'video') await video();
console.log('✓ assets written to', OUT);
