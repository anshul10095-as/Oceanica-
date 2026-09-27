// Deployment settings. Change SITE_URL to the production domain before launch.
export const SITE_URL = process.env.SITE_URL || 'https://www.oceanicalifestyle.com';

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
