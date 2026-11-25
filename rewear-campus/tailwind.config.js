/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#164B35', deep: '#102F23', 600: '#1d5e43' },
        sage: { DEFAULT: '#B9CDB5', soft: '#E3ECE0' },
        ivory: '#FAF8F2',
        ink: '#202420',
        gold: '#D4B477',
        terra: '#C97654',
        line: 'rgb(var(--line) / <alpha-value>)',
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        tint: 'rgb(var(--tint) / <alpha-value>)',
        onbrand: 'rgb(var(--onbrand) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      boxShadow: { lift: '0 12px 32px -16px rgb(16 47 35 / 0.35)' },
    },
  },
  plugins: [],
};
