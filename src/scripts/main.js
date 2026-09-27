/* Oceanica Lifestyle — progressive enhancement. The site is fully usable without this file. */
(() => {
  const doc = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Header: transparent over heroes, Midnight once scrolled, tucks away on scroll-down ── */
  const header = $('[data-header]');
  const heroLike = $('.hero, .page-hero, .project-hero');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    const threshold = heroLike ? 40 : -1;
    header.classList.toggle('is-scrolled', y > threshold);
    const menuOpen = document.body.classList.contains('is-locked');
    header.classList.toggle('is-hidden', !menuOpen && y > 600 && y > lastY + 4);
    if (y < lastY - 4 || y < 600) header.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('is-locked', open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); header.classList.add('is-scrolled'); }
    else { menu.classList.remove('is-open'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 600); onScroll(); }
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('is-locked')) { setMenu(false); toggle.focus(); } });

  /* ── Reveal on scroll ── */
  const revealables = $$('.reveal, .display, .reveal-img');
  // Anything in the first viewport animates on load, as one composed entrance.
  const io = 'IntersectionObserver' in window && !reduceMotion
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    : null;
  revealables.forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  /* ── Hero film: load only where it makes sense ── */
  const video = $('[data-hero-video]');
  if (video) {
    const conn = navigator.connection || {};
    const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    if (!reduceMotion && !saveData) {
      const small = matchMedia('(max-width: 900px)').matches;
      // H.264 MP4 plays in every mainstream browser, Safari and iOS included. WebM is
      // only a fallback for builds without H.264: Safari often answers "maybe" for VP9
      // WebM and then fails to play it, so it must never be the first choice.
      const ext = video.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
      // iOS autoplays only videos that are muted and inline before a source is set.
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.autoplay = true;
      video.src = `${small ? video.dataset.srcSm : video.dataset.srcLg}.${ext}`;
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
      // Autoplay can still be refused (iOS Low Power Mode, some in-app browsers).
      // Retry on the visitor's first tap; until then the still poster stays in place.
      const retry = () => video.play().catch(() => {});
      const start = () => video.play().catch(() => {
        addEventListener('touchend', retry, { once: true, passive: true });
        addEventListener('click', retry, { once: true });
      });
      if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
      // Pause when off-screen to save battery and bandwidth.
      new IntersectionObserver(([en]) => (en.isIntersecting ? start() : video.pause())).observe(video);
    }
  }

  /* ── Gentle parallax ── */
  const parallax = $$('[data-parallax]');
  if (parallax.length && !reduceMotion && matchMedia('(min-width: 901px)').matches) {
    let ticking = false;
    const update = () => {
      const vh = innerHeight;
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
        const img = el.querySelector('img');
        if (img) img.style.translate = `0 ${(p * -4).toFixed(2)}%`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  /* ── Core values: the frame follows the value in focus ── */
  const items = $$('[data-value]');
  const imgs = $$('[data-value-img]');
  const activate = (i) => {
    items.forEach((el) => el.classList.toggle('is-active', el.dataset.value === String(i)));
    imgs.forEach((el) => el.classList.toggle('is-active', el.dataset.valueImg === String(i)));
  };
  if (items.length) {
    activate(0);
    items.forEach((el) => {
      el.addEventListener('mouseenter', () => activate(el.dataset.value));
      el.addEventListener('focus', () => activate(el.dataset.value));
    });
    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && activate(en.target.dataset.value)),
        { rootMargin: '-45% 0px -45% 0px' });
      items.forEach((el) => vio.observe(el));
    }
  }

  /* ── Leadership profile dialogs ── */
  $$('[data-profile-open]').forEach((btn) => {
    const dlg = document.getElementById(`profile-${btn.dataset.profileOpen}`);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    btn.addEventListener('click', () => { dlg.showModal(); document.body.classList.add('is-locked'); });
    dlg.addEventListener('close', () => { document.body.classList.remove('is-locked'); btn.focus(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    $('[data-profile-close]', dlg).addEventListener('click', () => dlg.close());
  });

  /* ── Expandable biographies ── */
  $$('[data-expand-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const bio = btn.closest('.bio');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      bio.classList.toggle('is-expanded', open);
      if (!open) bio.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ── Enquiry form ── */
  const form = $('[data-enquiry]');
  if (form) {
    const status = $('[data-status]', form);
    const subject = new URLSearchParams(location.search).get('subject');
    if (subject) {
      const opt = [...form.subject.options].find((o) => o.text === subject);
      if (opt) opt.selected = true;
    }
    const validate = () => {
      let ok = true;
      $$('input, textarea, select', form).forEach((f) => {
        const wrap = f.closest('.field, .consent');
        const valid = f.checkValidity();
        wrap?.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      return ok;
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) { status.textContent = 'Please complete the highlighted fields.'; $('.is-invalid input, .is-invalid textarea, .is-invalid select', form)?.focus(); return; }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) { status.textContent = 'Online enquiries are not yet enabled. Please contact us by phone or email.'; return; }
      const data = Object.fromEntries(new FormData(form));
      data.page = location.pathname;
      status.textContent = 'Sending…';
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = 'Thank you. Your enquiry has been received; our team will be in touch.';
      } catch {
        status.textContent = 'Your enquiry could not be sent. Please try again, or contact us by phone or email.';
      }
    });
    form.addEventListener('input', (e) => e.target.closest('.field, .consent')?.classList.remove('is-invalid'));
  }
})();
