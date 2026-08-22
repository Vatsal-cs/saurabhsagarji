import { cookies } from 'next/headers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { PageTransition } from '@/components/ui/page-transition';
import { MotionConfig } from 'framer-motion';
import { isSiteLaunched } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { ComingSoonSplash } from './coming-soon-splash';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const launched = await isSiteLaunched();

  // Reading cookies() opts a route out of static rendering, so it's only
  // ever touched pre-launch (see /api/preview) — once `launched` is true
  // this branch never runs, and the site's normal caching is untouched.
  if (!launched) {
    const cookieStore = await cookies();
    const previewing = cookieStore.get('site_preview')?.value === 'granted';
    if (!previewing) {
      return <ComingSoonSplash lang={(locale === 'en' ? 'en' : 'hi') as Language} />;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Header locale={locale} />
      <main id="main" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer locale={locale} />
      <LanguageToggle />
    </MotionConfig>
  );
}
