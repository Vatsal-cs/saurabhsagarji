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
  return {
    title: {
      default: `${c.site_name} — ${c.site_tagline}`,
      template: `%s — ${c.site_name}`,
    },
    description: c.site_tagline,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    ),
    openGraph: {
      title: `${c.site_name} — ${c.site_tagline}`,
      description: c.site_tagline,
      type: 'website',
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
