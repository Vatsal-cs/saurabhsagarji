import { EB_Garamond, Noto_Serif_Devanagari } from 'next/font/google';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${ebGaramond.variable} ${notoSerifDev.variable}`}>
      <body className="flex min-h-screen flex-col bg-ivory text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
