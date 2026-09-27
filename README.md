# Oceanica Lifestyle — corporate website

Static, dependency-free website for Oceanica Lifestyle Pvt. Ltd., Patna. Pages are rendered at build time from a single content file, so the output is plain HTML, CSS and a small script that can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, S3, any web server).

```bash
npm install
npm run assets   # regenerate optimised images, video and icons from assets-source/
npm run dev      # build and serve at http://localhost:4173
npm run build    # write the production site to dist/
npm run build:strict  # same, but fails while any approved copy is still pending
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/content.mjs` | **All site copy.** The only file to edit for text changes. |
| `src/config.mjs` | Production domain, enquiry-form endpoint, navigation. |
| `src/sections.mjs` | Section templates (hero, about, values, projects, leadership …). |
| `src/pages.mjs` | Page composition, titles, descriptions and structured data. |
| `src/layout.mjs` | `<head>`, header, mobile menu, footer and legal disclosures. |
| `src/styles/main.css` | Design system: tokens, type scale, grid, components, motion. |
| `src/scripts/main.js` | Progressive enhancement: header, menu, reveals, video, dialogs, form. |
| `assets-source/` | Original media. Replace files here, then run `npm run assets`. |
| `public/` | Generated media and icons, copied into `dist/` as-is. |

## Content rules

Only approved Oceanica content is used. Anything not yet verified from the existing website is wrapped in `pending()` in `src/content.mjs`. Pending slots render as a discreet dashed "Approved copy pending" marker, are listed in `PENDING-CONTENT.md` on every build, and cause `npm run build:strict` to fail. Replace each `pending(...)` with the approved string (or an array of paragraph strings) and the marker disappears.

Never add figures, project facts, RERA numbers, configurations, prices, dates or claims that are not supplied by Oceanica.

## Replacing assets

| Asset | Source file | Notes |
| --- | --- | --- |
| Hero film | `assets-source/video/hero.mp4` | Encoded to 1080p and 720p H.264, muted, with a soft fade at the loop point. Not committed (large); keep the original safe. |
| Logo | `assets-source/brand/oceanica-wordmark.webp` | Transparent wordmark, used unmodified. |
| Emblem / favicons | `assets-source/brand/oceanica-emblem.webp` | The circular seal is cropped for icons. A clean transparent file will give better icons. |
| Editorial imagery | `assets-source/images/*` | Each file becomes `<name>-<width>.{avif,webp,jpg}`. |
| Leadership portraits | `assets-source/leadership/<slug>.jpg` | Cropped to 4:5 with a muted grade. Slug must match `leadership.people[].slug`. Current portraits were cropped from website screenshots; supply originals for sharper results. Thakur Nirmal Kumar Singh's portrait is awaited (a monogram shows until then). |
| Project imagery | `assets-source/projects/<slug>.jpg` | Referenced as `projects-<slug>` in `content.mjs`. |

Several section images are stills taken from the supplied hero film (`film-*`), so every photograph on the site is Oceanica-supplied material.

## Adding a project

Add an object to `projects.items` in `src/content.mjs` and drop its render into `assets-source/projects/`. The home page, projects page, a dedicated project page and the sitemap all pick it up automatically.

## Enquiry form

Set `FORM_ENDPOINT` in `src/config.mjs` (or as an environment variable at build time) to any service that accepts a JSON POST. Until then the form validates but directs visitors to phone and email.

## Before launch

1. Run `npm run build:strict` (it fails if any content slot is pending).
2. Confirm `SITE_URL` in `src/config.mjs` (canonical URLs, sitemap, Open Graph); it currently assumes `oceanica.co.in` from the company email.
3. Configure the form endpoint.
