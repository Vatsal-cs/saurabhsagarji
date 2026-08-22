import { EB_Garamond, Noto_Serif_Devanagari } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif-latin',
  display: 'swap',
});

const notoSerifDev = Noto_Serif_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif-devanagari',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `<html lang>` has to be set here in the root layout (Next.js only allows
  // one), but the root layout sits above the [locale] segment and gets no
  // params of its own. getLocale() reads the locale next-intl's middleware
  // already resolved for this request. Previously hardcoded to "hi", which
  // meant :lang(hi) CSS rules (e.g. the taller Devanagari line-height) were
  // silently applying to every /en page too, since the document never
  // actually claimed to be in English.
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${ebGaramond.variable} ${notoSerifDev.variable}`}>
      <body className="flex min-h-screen flex-col bg-ivory text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
