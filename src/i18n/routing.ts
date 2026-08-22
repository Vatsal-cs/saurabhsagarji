import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hi', 'en'],
  defaultLocale: 'hi',
  // Hindi stays at clean URLs (/books). English is prefixed (/en/books).
  localePrefix: 'as-needed',
  // Without this, next-intl auto-redirects first-time visitors based on
  // their browser's Accept-Language header, so anyone with an
  // English-language device lands on /en instead of the Hindi default.
  localeDetection: false,
});
