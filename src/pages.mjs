import * as C from './content.mjs';
import * as S from './sections.mjs';
import { SITE_URL } from './config.mjs';
import { esc, t, paras, pic, label, lines, linkCta, plain } from './lib.mjs';

const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE_URL + path })),
});

const heroPreload = `<link rel="preload" as="image" type="image/avif" imagesrcset="/assets/img/hero-poster-640.avif 640w, /assets/img/hero-poster-1024.avif 1024w, /assets/img/hero-poster-1600.avif 1600w, /assets/img/hero-poster-1920.avif 1920w" imagesizes="100vw" fetchpriority="high">`;

export const pages = [
  {
    path: '/',
    title: 'Home',
    preload: heroPreload,
    body: () => [
      S.hero(),
      S.about({ num: '01' }),
      S.brandStatement(),
      S.visionMission({ num: '02' }),
      S.values({ num: '03' }),
      S.philosophyOverview({ num: '04' }),
      S.projects({ num: '05' }),
      S.positioning(),
      S.leadershipOverview({ num: '06' }),
      S.contactSection({ num: '07' }),
      S.closing(),
    ].join('\n'),
  },
  {
    path: '/about/',
    title: 'About',
    description: `About ${C.company.legalName}: vision, mission, core values and leadership.`,
    schema: [crumbs([['Home', '/'], ['About', '/about/']])],
    body: () => [
      S.pageHero({ eyebrow: C.about.label, title: ['Building', 'A Better Tomorrow.'], image: 'film-colonnade' }),
      S.about({ full: true, num: '01' }),
      S.brandStatement(),
      S.visionMission({ num: '02' }),
      S.values({ num: '03' }),
      S.leadershipOverview({ num: '04' }),
      S.ctaBand(),
    ].join('\n'),
  },
  {
    path: '/philosophy/',
    title: 'Brand Philosophy',
    description: 'The Oceanica Lifestyle brand philosophy: think beyond today, tread lightly, prepare for what’s ahead, create lasting value.',
    schema: [crumbs([['Home', '/'], ['Philosophy', '/philosophy/']])],
    body: () => [
      S.pageHero({ eyebrow: C.philosophy.label, title: C.philosophy.pageStatement, image: 'film-garden-fountain' }),
      S.philosophyFull(),
      S.positioning(),
      S.closing(),
    ].join('\n'),
  },
  {
    path: '/projects/',
    title: 'Projects',
    description: `Developments by ${C.company.legalName}, including Oceanica Skyline, Patna.`,
    schema: [crumbs([['Home', '/'], ['Projects', '/projects/']])],
    body: () => [
      S.pageHero({ eyebrow: C.projects.label, title: C.projects.pageStatement, image: 'film-fountain-plan', intro: C.projects.support }),
      S.projects({ heading: false }),
      S.ctaBand({ eyebrow: 'Enquire', title: ['Discuss a', 'project with us.'] }),
    ].join('\n'),
  },
  ...C.projects.items.map((pr) => ({
    path: `/projects/${pr.slug}/`,
    title: pr.name,
    description: `${pr.name}, ${pr.location} — a ${pr.category.toLowerCase()} development by ${C.company.legalName}.`,
    schema: [
      crumbs([['Home', '/'], ['Projects', '/projects/'], [pr.name, `/projects/${pr.slug}/`]]),
      { '@context': 'https://schema.org', '@type': 'Residence', name: pr.name, description: pr.excerpt,
        address: { '@type': 'PostalAddress', addressLocality: 'Patna', addressRegion: 'Bihar', addressCountry: 'IN' } },
    ],
    body: () => projectPage(pr),
  })),
  {
    path: '/leadership/',
    title: 'Leadership',
    description: `The leadership of ${C.company.legalName}.`,
    schema: [
      crumbs([['Home', '/'], ['Leadership', '/leadership/']]),
      ...C.leadership.people.map((p) => ({ '@context': 'https://schema.org', '@type': 'Person', name: p.name, jobTitle: p.role.split(',')[0],
        worksFor: { '@type': 'Organization', name: C.company.legalName } })),
    ],
    body: () => [
      S.pageHero({ eyebrow: C.leadership.label, title: ['The people', 'behind the work.'], image: 'film-sculpture' }),
      S.leadershipFull(),
      S.ctaBand(),
    ].join('\n'),
  },
  {
    path: '/contact/',
    title: 'Contact',
    description: `Contact ${C.company.legalName}, ${C.company.city}.`,
    schema: [crumbs([['Home', '/'], ['Contact', '/contact/']])],
    body: () => [
      `<div class="page-top"></div>`,
      S.contactSection({ num: '' }),
      S.closing(),
    ].join('\n'),
  },
  {
    path: '/legal/',
    title: 'RERA Disclaimer & Disclaimer',
    description: `RERA disclaimer and website disclaimer of ${C.company.legalName}.`,
    body: () => `<div class="page-top"></div>
<section class="section legal">
  <div class="wrap grid">
    <div class="legal__head">${label('Legal')}${lines(['RERA &', 'Disclaimer.'], 'h1', 'display display--lg')}</div>
    <div class="legal__body">
      <section id="rera" aria-labelledby="h-rera"><h2 class="subhead" id="h-rera">RERA Disclaimer</h2><div class="prose">${paras(C.legal.reraDisclaimer)}</div></section>
      <section id="disclaimer" aria-labelledby="h-disc"><h2 class="subhead" id="h-disc">Disclaimer</h2><div class="prose">${paras(C.legal.generalDisclaimer)}</div></section>
    </div>
  </div>
</section>`,
  },
  {
    path: '/404.html',
    title: 'Page not found',
    noindex: true,
    body: () => `<section class="page-hero page-hero--plain">
  <div class="page-hero__content wrap">
    <p class="eyebrow eyebrow--light">404</p>
    ${lines(['This page', 'could not be found.'], 'h1', 'display display--page')}
    <div class="reveal" style="margin-top:3rem">${linkCta('/', 'Return home', 'cta--light')}</div>
  </div>
</section>`,
  },
];

function projectPage(pr) {
  const facts = pr.facts.length
    ? `<dl class="facts reveal">${pr.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`
    : '';
  return `<section class="project-hero">
  <div class="project-hero__media">${pic(pr.image, { eager: true, alt: pr.imageAlt, sizes: '100vw', placeholder: `${pr.name} — imagery to be supplied` })}
    <div class="project-hero__veil" aria-hidden="true"></div>
    ${pr.imageCaption ? `<span class="project__caption">${esc(pr.imageCaption)}</span>` : ''}
  </div>
  <div class="project-hero__content wrap">
    <p class="eyebrow eyebrow--light reveal">A development by ${esc(C.company.name)}</p>
    ${lines(pr.name, 'h1', 'display display--page')}
    <p class="project-hero__meta reveal">${esc(pr.category)} · ${esc(pr.location)}${pr.status ? ` · ${esc(pr.status)}` : ''}</p>
  </div>
</section>
<section class="section project-detail">
  <div class="wrap grid">
    <div class="project-detail__label">${label('Overview')}</div>
    <div class="project-detail__body">
      <div class="prose prose--lead reveal">${paras(pr.description)}</div>
      ${facts}
      <div class="project-detail__ctas reveal">
        ${linkCta(`/contact/?subject=${encodeURIComponent(pr.name)}#enquire`, `Enquire about ${pr.name}`)}
        ${linkCta('/projects/', 'All projects')}
      </div>
    </div>
  </div>
</section>
${S.ctaBand({ eyebrow: C.company.name, title: ['Part of a larger', 'philosophy.'], href: '/philosophy/', text: 'Our philosophy' })}`;
}
