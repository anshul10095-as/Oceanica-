# ReWear Campus

Mobile-first Progressive Web App for **ReWear Campus**, a campus-based formal and ethnic wear rental service piloted for CHRIST University, Central Campus, Bengaluru. *Repeat the Style. Not the Spend.*

It implements the three offerings from the founding poster: **ReWear Rentals** (pay per use), **ReWear Pass** (monthly credits) and **ReWear Pop-Up** (campus racks with fittings and pickups), plus a student dashboard, a sustainability page, the entrepreneurial story and a separate demo admin portal.

This is a working prototype. Payments, bookings and locations are simulated, prices are proposed pilot prices, and seeded records are labelled as demo data. ReWear Campus is a student venture, not an official university service.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # deployable PWA in dist/ (manifest, service worker, icons, offline page)
npm run build:single   # one self-contained HTML file in dist-single/ for sandboxed previews
npm run icons          # regenerate PWA icons from the monogram
```

Requires Node 18+.

## Deploy

`dist/` is static and uses relative paths and hash routes, so it works from any sub-path with no server rewrites. Netlify, Vercel, Cloudflare Pages or GitHub Pages: publish `dist/` after `npm run build`. HTTPS is required for the service worker and install prompt (all of those hosts provide it). For QR-based acquisition, point a QR code at the deployed URL, for example `https://<your-host>/#home` or `#popups`.

## Install as an app

* Android (Chrome, Edge, Samsung Internet): *Install app* from the browser menu, or the **Install app** link in the top bar when the browser offers it.
* iPhone and iPad (Safari): Share → *Add to Home Screen*.
* Windows and macOS (Chrome, Edge): the install icon at the right of the address bar.

Offline, the cached app shell and pages still open, a banner explains that reservations are paused, and checkout refuses to confirm a booking. The service worker caches static assets only, never booking or contact data (that stays in the page's `localStorage`).

## Demo access

Open `#demo`. There are no passwords: choose **Continue as Student** or **Open Demo Admin** (`#admin`). The demo page links all five classroom journeys and has **Reset demo data**. Student and admin tabs open side by side stay in sync through `localStorage` events.

| Journey | Path |
| --- | --- |
| Rental | Home → Formal Wear → Classic Navy Placement Blazer → size → date → Rent Now → Checkout → Confirmation → My Wardrobe |
| Subscription | ReWear Pass → compare → choose Plus → rent an eligible garment with a credit → remaining credits on the pass card |
| Pop-up | Campus Pop-Ups → Placement Week Pop-Up → pick a free slot (10:00 AM is deliberately full) → confirmation |
| Administration | Admin → Rentals → Confirm/mark ready → Mark collected → Process return → Quality check → Approve deposit refund |
| Sustainability | After journey 4, Cleaning & repair shows the job; Sustainability → “Only transactions made in this demo session” shows the completed rental |

## Structure

```
src/
  data/        types.ts (domain model), catalogue.ts (32 garments, size charts), seed.ts (demo data, plans, policies)
  store/       rules.ts (availability, pricing, credits, metrics), store.tsx (single source of truth + actions)
  lib/         router (hash routes), util (money, dates), pwa (install + service worker registration)
  components/  GarmentArt (garment renderings), Product, Calendar, Layout (nav, search, footer), Brand, ui (modal, toasts, skeletons…)
  pages/       Home, Catalogue, ProductDetail, Bag (bag, checkout, confirmation, pickup pass, receipt), Pass, Popups,
               Wardrobe, FindMyFit, Sustainability, Story, Misc (feedback, profile, demo, policies, help)
  pages/admin/ AdminShell, Overview, Rentals, Inventory, Operations (subscriptions, pop-ups, maintenance, policies), Analytics (+ feedback)
public/        manifest.webmanifest, sw.js, offline.html, icons/
```

## Business rules implemented

* Each booking holds a specific physical unit from pickup to return plus a configurable cleaning buffer; overlapping holds are rejected, including between items in the same bag.
* Sizes with no stock, units under cleaning or repair, blocked dates, past dates and dates beyond the booking window cannot be booked.
* Refundable deposits are recorded and reported separately from rental revenue; credit redemptions are a third, separate line.
* Each ReWear Pass credit is tied to one booking line, so it cannot be redeemed twice; cancelling within the free window restores it. No unlimited plans.
* Returns move garments to cleaning; a unit becomes available again only when its cleaning (and any repair) record is completed.
* Fitting slots cannot be overbooked, and admins cannot lower capacity below existing bookings.
* Garments with active bookings cannot be archived, and their booked sizes cannot be removed.
* Extensions are approved only if the next booking for the same unit allows it.
* All charges and rules (lead time, buffer, 72-hour surcharge, extension fee, cancellation window, cleaning cost, racks, slots, plan prices) are editable under Admin → Policies & pricing.

## Production limitations

* **No backend.** Data lives in one browser's `localStorage`. A real pilot needs a server database, authentication and concurrency control so two students cannot take the last unit at the same moment.
* **Simulated payments.** UPI, card and pay-at-pickup only record entries. A payment gateway (and refunds through it) is required before launch.
* **Product imagery.** Garments are shown as consistent studio-style renderings drawn in SVG because no licensed photography was available. Each garment accepts a photo URL in Admin → Inventory; real photography of the actual pilot stock should replace them.
* **Find My Fit** is rules-based matching on the live catalogue, not an AI model.
* Demo analytics mix seeded records with session transactions; every view can be switched to session-only.
* Policies are drafts and need legal review; campus locations need approval.
