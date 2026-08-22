import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const c = await getSiteContentBatch(['site_name', 'site_tagline'], lang);
  // Relative — resolved against metadataBase below into a full URL.
  const shareImage = '/site-photo.jpg';
  return {
    title: {
      default: `${c.site_name} — ${c.site_tagline}`,
      template: `%s — ${c.site_name}`,
    },
    description: c.site_tagline,
    // Falls back to the real domain, not localhost — this value resolves
    // every relative Open Graph/canonical URL the site emits, so a wrong
    // fallback here would silently break link previews and search results
    // in production if the env var were ever missing on Vercel.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saurabhsagarji.in'),
    robots: { index: true, follow: true },
    verification: { google: 'p_Apvra5ijYtyq52Uv0UJeYqnfsOpzXeocsB00rMSaQ' },
    openGraph: {
      title: `${c.site_name} — ${c.site_tagline}`,
      description: c.site_tagline,
      type: 'website',
      locale: lang === 'en' ? 'en_US' : 'hi_IN',
      images: [{ url: shareImage, width: 1200, height: 1200 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.site_name} — ${c.site_tagline}`,
      description: c.site_tagline,
      images: [shareImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Explicitly pin the locale for THIS render tree. Every getTranslations()
  // and getLocale() call in Header, Footer, and every page below this point
  // will now read from this value instead of unreliable header-based
  // auto-detection (which the Turbopack dev bug breaks for /en).
  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
