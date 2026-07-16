import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hi', 'en'],
  defaultLocale: 'hi',
  // Hindi stays at clean URLs (/books). English is prefixed (/en/books).
  localePrefix: 'as-needed',
});
