import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { getPublishedAboutSections } from '@/lib/about';
import { getPublishedBooks } from '@/lib/books';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saurabhsagarji.in').replace(/\/$/, '');

const STATIC_PATHS = ['/', '/about', '/bhajans', '/books', '/contact', '/events', '/gallery', '/teachings'] as const;

/** Every locale variant of one path, as the `languages` alternates map
 * sitemap entries use to tell Google the hi/en pages are translations of
 * each other rather than duplicate/competing content. */
function localizedEntry(pathname: string, lastModified?: Date) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}${getPathname({ locale, href: pathname })}`])
  );
  return {
    url: languages[routing.defaultLocale],
    lastModified,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [aboutSections, books] = await Promise.all([getPublishedAboutSections(), getPublishedBooks()]);

  const staticEntries = STATIC_PATHS.map((path) => localizedEntry(path));

  const aboutEntries = aboutSections.map((section) => localizedEntry(`/about/${section.slug}`));

  const bookEntries = books.map((book) =>
    localizedEntry(`/books/${book.slug}`, book.published_at ? new Date(book.published_at) : undefined)
  );

  return [...staticEntries, ...aboutEntries, ...bookEntries];
}
