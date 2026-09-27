import * as C from './content.mjs';
import { FORM_ENDPOINT } from './config.mjs';
import { esc, t, paras, pic, label, lines, linkCta, arrow, arrowDown, plus, isPending, imgUrl } from './lib.mjs';

const pad2 = (n) => String(n).padStart(2, '0');

// ── Hero (home) ───────────────────────────────────────────────────────────────
export function hero() {
  const h = C.hero;
  return `<section class="hero" data-hero aria-label="Introduction">
  <div class="hero__media" aria-hidden="true">
    <video class="hero__video" autoplay muted loop playsinline preload="auto" disablepictureinpicture
      poster="/assets/img/hero-poster-1600.jpg" data-hero-video>
      <source src="/assets/video/hero-720.mp4" type="video/mp4" media="(max-width: 900px)">
      <source src="/assets/video/hero-1080.mp4" type="video/mp4">
      <source src="/assets/video/hero-1080.webm" type="video/webm">
    </video>
    <script>
      // Runs as soon as the video is parsed: honour Reduce Motion and data-saver before any download.
      (function (v) {
        var c = navigator.connection || {};
        if (matchMedia('(prefers-reduced-motion: reduce)').matches || c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) {
          v.autoplay = false; v.removeAttribute('autoplay'); v.preload = 'none';
          while (v.firstElementChild) v.removeChild(v.firstElementChild);
          v.load();
        }
      })(document.currentScript.previousElementSibling);
    </script>
    ${pic('hero-poster', { eager: true, cls: 'hero__poster', sizes: '100vw' })}
    <div class="hero__veil"></div>
  </div>
  <div class="hero__content wrap">
    <p class="eyebrow eyebrow--light reveal">${esc(h.label)}</p>
    ${lines(h.lines, 'h1', 'display display--hero')}
    <p class="hero__support reveal" style="--d:.5s">${esc(h.support)}</p>
    <a class="hero__cta reveal" style="--d:.7s" href="#about"><span>${esc(h.cta)}</span>${arrowDown}</a>
  </div>
  <p class="hero__place" aria-hidden="true">${esc(C.company.city)}</p>
</section>`;
}

// ── Inner page hero ───────────────────────────────────────────────────────────
export function pageHero({ eyebrow, title, image, alt = '', intro }) {
  return `<section class="page-hero" aria-label="${esc(eyebrow)}">
  <div class="page-hero__media" aria-hidden="${alt ? 'false' : 'true'}">
    ${pic(image, { eager: true, alt, sizes: '100vw', cls: 'page-hero__img' })}
    <div class="page-hero__veil"></div>
  </div>
  <div class="page-hero__content wrap">
    <p class="eyebrow eyebrow--light reveal">${esc(eyebrow)}</p>
    ${lines(title, 'h1', 'display display--page')}
    ${intro ? `<p class="page-hero__intro reveal" style="--d:.5s">${esc(intro)}</p>` : ''}
  </div>
</section>`;
}

// ── About ─────────────────────────────────────────────────────────────────────
export function about({ full = false, num = '01' } = {}) {
  const a = C.about;
  return `<section class="about section" id="about">
  <div class="wrap grid">
    <div class="about__head">
      ${label(a.label, num)}
      ${lines(a.statement, 'h2', 'display display--xl about__statement')}
    </div>
    <figure class="about__figure frame reveal-img">
      ${pic('aerial-patna-render', { alt: 'Illustrative aerial render of Patna at dusk, with the river, a long bridge and the city beyond', sizes: '(min-width: 1024px) 66vw, 100vw' })}
      <figcaption>${esc(a.imageCaption)}</figcaption>
    </figure>
    <div class="about__body">
      <h3 class="subhead reveal">${esc(full ? a.pageTitle : a.sectionTitle)}</h3>
      <div class="prose reveal">${paras(full ? a.intro : a.intro.slice(0, a.homeParagraphs))}</div>
      ${full ? '' : `<div class="reveal">${linkCta('/about/', 'Explore Oceanica')}</div>`}
    </div>
  </div>
</section>`;
}

// ── Brand statement ───────────────────────────────────────────────────────────
export function brandStatement() {
  return `<section class="statement section section--dark" aria-label="Brand statement">
  <div class="wrap">
    <span class="rule rule--center" aria-hidden="true"></span>
    ${lines(C.brandStatement.lines, 'p', 'display display--xl statement__text')}
    <p class="statement__sign reveal">${esc(C.company.tagline)} · ${esc(C.company.taglineSecondary)}</p>
  </div>
</section>`;
}

// ── Vision & Mission ──────────────────────────────────────────────────────────
export function visionMission({ num = '02' } = {}) {
  const row = (d, img, alt, reverse, serif = false) => `<div class="vm__row grid${reverse ? ' vm__row--reverse' : ''}">
    <figure class="vm__figure frame reveal-img" data-parallax>
      ${pic(img, { alt, sizes: '(min-width: 1024px) 50vw, 100vw' })}
    </figure>
    <div class="vm__text">
      <p class="eyebrow reveal">${esc(d.label)}</p>
      <h3 class="display display--lg vm__title reveal">${esc(d.title)}</h3>
      <div class="prose ${serif ? 'prose--serif' : 'prose--lead'} reveal">${paras(d.body)}</div>
    </div>
  </div>`;
  return `<section class="vm section section--parchment" id="vision" aria-label="Vision and Mission">
  <div class="wrap">
    ${label('Vision & Mission', num)}
    ${row(C.vision, 'film-colonnade', 'A glass colonnade at golden hour framing bronze water walls', false, true)}
    ${row(C.mission, 'film-water-wall', 'A bronze-framed water wall in a landscaped courtyard at sunset', true)}
  </div>
</section>`;
}

// ── Core values ───────────────────────────────────────────────────────────────
export function values({ num = '03' } = {}) {
  const v = C.values;
  const imgs = v.items.map((it, i) =>
    `<div class="values__img${i === 0 ? ' is-active' : ''}" data-value-img="${i}">${pic(it.image, { sizes: '(min-width: 1024px) 40vw, 1px' })}</div>`).join('');
  const rows = v.items.map((it, i) => `<li class="values__item reveal" data-value="${i}" tabindex="0">
      <span class="values__num">${pad2(i + 1)}</span>
      <div>
        <h3 class="values__name">${esc(it.name)}</h3>
        ${it.body ? `<div class="values__body">${paras(it.body)}</div>` : ''}
      </div>
    </li>`).join('');
  return `<section class="values section" id="values" aria-label="Core values">
  <div class="wrap grid">
    <div class="values__aside">
      ${label(v.label, num)}
      ${lines(v.statement, 'h2', 'display display--lg')}
      <div class="values__frame frame" aria-hidden="true">${imgs}</div>
    </div>
    <ol class="values__list">${rows}</ol>
  </div>
</section>`;
}

// ── Philosophy ────────────────────────────────────────────────────────────────
export function philosophyOverview({ num = '04' } = {}) {
  const p = C.philosophy;
  const cols = p.principles.map((pr, i) => `<li class="pillar reveal" style="--d:${i * 0.12}s">
      <figure class="pillar__figure frame">${pic(pr.image, { alt: pr.alt, sizes: '(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw' })}</figure>
      <span class="pillar__numeral">${pr.numeral}</span>
      <h3 class="pillar__name">${esc(pr.name)}</h3>
      <div class="pillar__body">${paras(pr.body)}</div>
    </li>`).join('');
  return `<section class="philosophy section section--dark" id="philosophy">
  <div class="wrap">
    <div class="philosophy__head grid">
      <div class="philosophy__title">
        ${label(p.label, num)}
        ${lines(p.statement, 'h2', 'display display--xl')}
      </div>
      <div class="philosophy__intro prose prose--light reveal">${paras(p.intro)}
        ${linkCta('/philosophy/', 'Our philosophy', 'cta--light')}</div>
    </div>
    <ol class="pillars">${cols}</ol>
  </div>
</section>`;
}

export function philosophyFull() {
  const p = C.philosophy;
  const intro = `<section class="section philosophy-intro">
    <div class="wrap grid">
      <div class="philosophy-intro__label">${label(p.label)}</div>
      <div class="philosophy-intro__text prose prose--lead reveal">${paras(p.intro)}</div>
    </div>
  </section>`;
  const blocks = p.principles.map((pr, i) => `<section class="principle${i % 2 ? ' principle--reverse' : ''}" aria-labelledby="pr-${i}">
    <figure class="principle__figure reveal-img" data-parallax>${pic(pr.image, { alt: pr.alt, sizes: '(min-width: 1024px) 60vw, 100vw' })}</figure>
    <div class="principle__text">
      <span class="principle__numeral reveal">${pr.numeral}</span>
      <h2 class="display display--lg reveal" id="pr-${i}">${esc(pr.name)}</h2>
      <div class="prose prose--lead reveal">${paras(pr.body)}</div>
    </div>
  </section>`).join('');
  return intro + `<div class="principles">${blocks}</div>`;
}

// ── Projects ──────────────────────────────────────────────────────────────────
function projectFeature(pr, i) {
  return `<article class="project grid">
    <a class="project__figure frame reveal-img" href="/projects/${pr.slug}/" tabindex="-1" aria-hidden="true">
      ${pic(pr.image, { alt: pr.imageAlt, sizes: '(min-width: 1024px) 60vw, 100vw', placeholder: `${pr.name} — imagery to be supplied` })}
    </a>
    <div class="project__text">
      <p class="project__meta reveal"><span>${pad2(i + 1)}</span> / ${esc(pr.category)}${pr.status ? ` · ${esc(pr.status)}` : ''}</p>
      <h3 class="display display--lg project__name reveal">${esc(pr.name)}</h3>
      <p class="project__loc reveal">${esc(pr.location)}</p>
      <p class="project__excerpt reveal">${esc(pr.excerpt)}</p>
      <div class="reveal">${linkCta(`/projects/${pr.slug}/`, 'Discover project')}</div>
    </div>
  </article>`;
}

export function projects({ num = '05', heading = true } = {}) {
  const p = C.projects;
  return `<section class="projects section" id="projects">
  <div class="wrap">
    ${heading ? `<div class="projects__head grid">
      <div>${label(p.label, num)}${lines(p.statement, 'h2', 'display display--xl')}</div>
      <p class="projects__support reveal">${esc(p.support)}</p>
    </div>` : ''}
    <div class="projects__list">${p.items.map(projectFeature).join('')}</div>
  </div>
</section>`;
}

// ── Positioning ───────────────────────────────────────────────────────────────
export function positioning() {
  const p = C.positioning;
  const cols = p.pillars.map((pl, i) => `<li class="approach__col reveal" style="--d:${i * 0.15}s">
      <span class="approach__num">${pad2(i + 1)}</span>
      <h3 class="approach__name">${esc(pl.name)}</h3>
      <ul class="approach__refs">${pl.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    </li>`).join('');
  return `<section class="approach section section--marine" aria-label="${esc(p.label)}">
  <div class="approach__bg" aria-hidden="true" data-parallax>${pic('film-water-detail', { sizes: '100vw' })}</div>
  <div class="wrap">
    <p class="eyebrow eyebrow--light reveal">${esc(p.label)}</p>
    ${lines(p.statement, 'h2', 'display display--xl approach__statement')}
    <ol class="approach__cols">${cols}</ol>
  </div>
</section>`;
}

// ── Leadership ────────────────────────────────────────────────────────────────
const initials = (name) => name.replace(/^(Capt\.|Mrs\.|Mr\.|Dr\.)\s*/, '').split(/\s+/).map((w) => w[0]).join('');

function portrait(p, sizes) {
  return p.portrait
    ? pic(p.portrait, { alt: `Portrait of ${p.name}`, sizes })
    : `<div class="portrait-empty" role="img" aria-label="Portrait of ${esc(p.name)} to be supplied"><span>${esc(initials(p.name))}</span></div>`;
}

const excerpt = (bio) => {
  const first = bio[0];
  const cut = first.slice(0, 190);
  return first.length > 190 ? cut.slice(0, cut.lastIndexOf(' ')) + '…' : first;
};

export function leadershipOverview({ num = '06' } = {}) {
  const L = C.leadership;
  const cards = L.people.map((p, i) => `<li class="leader reveal" style="--d:${i * 0.1}s">
      <button class="leader__open" type="button" data-profile-open="${p.slug}" aria-haspopup="dialog">
        <span class="leader__portrait frame">${portrait(p, '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw')}</span>
        <span class="leader__name">${esc(p.name)}</span>
        <span class="leader__role">${esc(p.role)}</span>
        <span class="leader__more">Read profile ${plus}</span>
      </button>
    </li>`).join('');
  const dialogs = L.people.map((p) => `<dialog class="profile" id="profile-${p.slug}" aria-labelledby="profile-${p.slug}-name">
      <div class="profile__inner">
        <button class="profile__close" type="button" data-profile-close aria-label="Close profile">Close <span aria-hidden="true">×</span></button>
        <div class="profile__portrait frame">${portrait(p, '(min-width: 1024px) 40vw, 100vw')}</div>
        <div class="profile__text">
          <p class="eyebrow">${esc(L.label)}</p>
          <h3 class="display display--md" id="profile-${p.slug}-name">${esc(p.name)}</h3>
          <p class="profile__role">${esc(p.role)}</p>
          <div class="prose">${paras(p.bio)}</div>
        </div>
      </div>
    </dialog>`).join('');
  return `<section class="leadership section" id="leadership">
  <div class="wrap">
    <div class="leadership__head grid">
      <div>${label(L.label, num)}${lines(L.statement, 'h2', 'display display--xl')}</div>
      <div class="leadership__link reveal">${linkCta('/leadership/', 'All profiles')}</div>
    </div>
    <ul class="leaders">${cards}</ul>
  </div>
  ${dialogs}
</section>`;
}

export function leadershipFull() {
  const L = C.leadership;
  const rows = L.people.map((p, i) => `<article class="bio grid${i % 2 ? ' bio--reverse' : ''}" id="${p.slug}">
      <figure class="bio__portrait frame reveal-img">${portrait(p, '(min-width: 1024px) 40vw, 100vw')}</figure>
      <div class="bio__text">
        <span class="bio__num reveal">${pad2(i + 1)}</span>
        <h2 class="display display--lg reveal">${esc(p.name)}</h2>
        <p class="bio__role reveal">${esc(p.role)}</p>
        <p class="bio__excerpt reveal">${esc(excerpt(p.bio))}</p>
        <div class="bio__full" id="bio-${p.slug}" data-expand>
          <div class="bio__full-inner prose">${paras(p.bio)}</div>
        </div>
        <button class="expand reveal" type="button" aria-expanded="false" aria-controls="bio-${p.slug}" data-expand-toggle>
          <span data-closed>Read full profile</span><span data-open>Close profile</span>${plus}
        </button>
      </div>
    </article>`).join('');
  return `<section class="section bios"><div class="wrap">${rows}</div></section>`;
}

// ── Contact ───────────────────────────────────────────────────────────────────
export function contactSection({ num = '07', subject = '' } = {}) {
  const c = C.contact;
  const val = (v, href) => (isPending(v) ? t(v) : href ? `<a href="${href}">${esc(v)}</a>` : esc(v));
  const opts = c.subjects.map((s) => `<option${s === subject ? ' selected' : ''}>${esc(s)}</option>`).join('');
  return `<section class="contact section section--dark" id="contact">
  <div class="wrap grid">
    <div class="contact__info">
      ${label(c.label, num)}
      ${lines(c.statement, 'h2', 'display display--xl')}
      <dl class="contact__details reveal">
        <div><dt>${esc(c.officeLabel)}</dt><dd>${val(c.address)}</dd></div>
        <div><dt>Phone</dt><dd>${val(c.phone, c.phoneHref && `tel:${c.phoneHref}`)}</dd></div>
        <div><dt>Email</dt><dd>${val(c.email, c.emailHref && `mailto:${c.emailHref}`)}</dd></div>
      </dl>
    </div>
    <form class="enquiry reveal" id="enquire" data-enquiry data-endpoint="${esc(FORM_ENDPOINT)}" novalidate>
      <p class="eyebrow eyebrow--light">Enquiry</p>
      <div class="field"><input id="f-name" name="name" type="text" autocomplete="name" required placeholder=" "><label for="f-name">Name</label></div>
      <div class="field-row">
        <div class="field"><input id="f-email" name="email" type="email" autocomplete="email" required placeholder=" "><label for="f-email">Email</label></div>
        <div class="field"><input id="f-mobile" name="mobile" type="tel" autocomplete="tel" inputmode="tel" required pattern="[0-9+()\\-\\s]{8,}" placeholder=" "><label for="f-mobile">Mobile</label></div>
      </div>
      <div class="field field--select"><select id="f-subject" name="subject" required><option value="" disabled${subject ? '' : ' selected'}></option>${opts}</select><label for="f-subject">Subject</label></div>
      <div class="field"><textarea id="f-message" name="message" rows="3" required placeholder=" "></textarea><label for="f-message">Message</label></div>
      <label class="consent"><input type="checkbox" name="consent" required><span>${t(c.consent)}</span></label>
      <button class="cta cta--light cta--submit" type="submit"><span class="cta__label">Send enquiry</span><span class="cta__line" aria-hidden="true"></span>${arrow}</button>
      <p class="enquiry__status" role="status" aria-live="polite" data-status></p>
    </form>
  </div>
  ${c.mapEmbed ? `<div class="contact__map wrap"><iframe title="Oceanica corporate office location" src="${esc(c.mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
</section>`;
}

// ── Closing ───────────────────────────────────────────────────────────────────
export function closing() {
  return `<section class="closing section" aria-label="Closing statement">
  <div class="wrap">
    <span class="rule rule--center" aria-hidden="true"></span>
    ${lines(C.closing.lines, 'p', 'display display--xl closing__text')}
    <p class="closing__mark reveal">${esc(C.company.name)}</p>
  </div>
</section>`;
}

// ── Call-to-action band (inner pages) ────────────────────────────────────────
export function ctaBand({ eyebrow = 'Enquire', title = ['Begin a', 'Conversation.'], href = '/contact/#enquire', text = 'Contact Oceanica' } = {}) {
  return `<section class="cta-band section section--parchment">
  <div class="wrap cta-band__inner">
    <div>${label(eyebrow)}${lines(title, 'h2', 'display display--lg')}</div>
    <div class="reveal">${linkCta(href, text)}</div>
  </div>
</section>`;
}

export { imgUrl };
