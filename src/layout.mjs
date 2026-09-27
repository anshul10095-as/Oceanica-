import { SITE_URL, NAV } from './config.mjs';
import { company, legal, contact } from './content.mjs';
import { esc, t, plain, paras, isPending, arrow, plus } from './lib.mjs';

const logo = (cls = '') => `<picture class="logo ${cls}">
  <source type="image/webp" srcset="/assets/brand/oceanica-wordmark-360.webp 360w, /assets/brand/oceanica-wordmark-720.webp 720w" sizes="180px">
  <img src="/assets/brand/oceanica-wordmark-360.png" alt="Oceanica" width="360" height="60">
</picture>`;

function head({ title, description, path, schema = [], preload = '' }) {
  const url = SITE_URL + path;
  const fullTitle = path === '/' ? `${company.legalName} — Building A Better Tomorrow` : `${title} — ${company.name}`;
  const desc = description || company.description;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.legalName,
    alternateName: company.name,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/brand/oceanica-wordmark-720.png`,
    address: { '@type': 'PostalAddress', streetAddress: contact.addressParts.street, addressLocality: contact.addressParts.locality,
      addressRegion: contact.addressParts.region, postalCode: contact.addressParts.postalCode, addressCountry: contact.addressParts.country },
    ...(plain(contact.email) && { email: plain(contact.email) }),
    ...(plain(contact.phone) && { telephone: plain(contact.phone) }),
  };
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#061C29">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(company.legalName)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/assets/brand/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="/assets/css/main.css">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify([org, ...schema])}</script>
</head>`;
}

function header(path) {
  const items = NAV.map(
    (n) => `<li><a href="${n.href}"${path.startsWith(n.href) ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`
  ).join('');
  const mobileItems = NAV.map(
    (n, i) => `<li style="--i:${i}"><a href="${n.href}"><span class="menu__num">0${i + 1}</span>${esc(n.label)}</a></li>`
  ).join('');
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="site-header__brand" href="/" aria-label="Oceanica Lifestyle — home">${logo()}</a>
    <nav class="site-nav" aria-label="Primary"><ul>${items}</ul></nav>
    <a class="site-header__enquire" href="/contact/#enquire">Enquire</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="menu-toggle__label">Menu</span><span class="menu-toggle__bars" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Mobile">
    <ul class="menu__list">${mobileItems}</ul>
  </nav>
  <div class="menu__foot">
    <a class="cta cta--light" href="/contact/#enquire"><span class="cta__label">Enquire</span><span class="cta__line" aria-hidden="true"></span>${arrow}</a>
    <p class="menu__place">${esc(company.name)} · ${esc(company.city)}</p>
  </div>
</div>`;
}

function footer() {
  const nav = NAV.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('');
  const line = (label, v, href) =>
    isPending(v) ? `<li><span class="footer__k">${label}</span>${t(v)}</li>`
      : `<li><span class="footer__k">${label}</span>${href ? `<a href="${href}">${esc(v)}</a>` : esc(v)}</li>`;
  const year = new Date().getFullYear();
  return `<footer class="site-footer" id="footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a href="/" aria-label="Oceanica Lifestyle — home">${logo('logo--footer')}</a>
        <p class="footer__tagline">${esc(company.tagline)}<span>${esc(company.taglineSecondary)}</span></p>
        <p class="footer__desc">${t(company.description)}</p>
      </div>
      <nav class="footer__col footer__col--nav" aria-label="Footer">
        <p class="footer__h">Explore</p>
        <ul>${nav}<li><a href="/projects/oceanica-skyline/">Oceanica Skyline</a></li></ul>
      </nav>
      <div class="footer__col footer__col--contact">
        <p class="footer__h">Contact</p>
        <ul class="footer__contact">
          ${line('Address', contact.address)}
          ${line('Phone', contact.phone, contact.phoneHref && `tel:${contact.phoneHref}`)}
          ${line('Email', contact.email, contact.emailHref && `mailto:${contact.emailHref}`)}
        </ul>
      </div>
    </div>

    <div class="footer__legal">
      <details class="disclosure">
        <summary><span>RERA Disclaimer</span>${plus}</summary>
        <div class="disclosure__body">${paras(legal.reraDisclaimer)}</div>
      </details>
      <details class="disclosure">
        <summary><span>Disclaimer</span>${plus}</summary>
        <div class="disclosure__body">${paras(legal.generalDisclaimer)}</div>
      </details>
    </div>

    <div class="footer__bottom">
      <p>All rights are reserved · Copyright © ${year} ${esc(company.legalName)}</p>
      <ul class="footer__links">
        <li><a href="/legal/#rera">RERA Disclaimer</a></li>
        <li><a href="/legal/#disclaimer">Disclaimer</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

export function page({ title, description, path, body, schema, preload, headerTheme = 'dark' }) {
  return `${head({ title, description, path, schema, preload })}
<body data-header-theme="${headerTheme}">
${header(path)}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}
