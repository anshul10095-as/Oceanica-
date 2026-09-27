// Deployment settings. Confirm SITE_URL is the production domain before launch
// (assumed from the company email domain, oceanica.co.in).
export const SITE_URL = process.env.SITE_URL || 'https://www.oceanica.co.in';

// Sub-path the site is served from, e.g. '/Oceanica-' on GitHub Pages. Empty at a domain root.
export const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');

// POST endpoint for the enquiry form (e.g. a Formspree / Basin / serverless URL).
// The form sends JSON: { name, email, mobile, subject, message, consent, page }.
// While empty, the form validates but tells visitors to use phone or email instead.
export const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';

export const NAV = [
  { label: 'About', href: '/about/' },
  { label: 'Philosophy', href: '/philosophy/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Leadership', href: '/leadership/' },
  { label: 'Contact', href: '/contact/' },
];
