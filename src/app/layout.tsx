import type { Metadata } from 'next';
import { EB_Garamond, Noto_Serif_Devanagari } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getSiteContentBatch } from '@/lib/site-content';
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

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContentBatch(['site_name', 'site_tagline']);
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hi"
      className={`${ebGaramond.variable} ${notoSerifDev.variable}`}
    >
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}