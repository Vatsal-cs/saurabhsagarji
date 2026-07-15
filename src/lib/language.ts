'use server';

import { cookies } from 'next/headers';

export type Language = 'hi' | 'en';

const COOKIE_NAME = 'lang';

/**
 * Reads the current language from a session cookie (no expiry set, so the
 * browser clears it when fully closed — every new visit starts in Hindi).
 * Defaults to Hindi if the cookie isn't set.
 */
export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value === 'en' ? 'en' : 'hi';
}

/**
 * Server Action: sets the language cookie. Called from the client toggle,
 * followed by router.refresh() so Server Components re-render in the new language.
 */
export async function setLanguage(lang: Language): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, lang, { path: '/', sameSite: 'lax' });
}
