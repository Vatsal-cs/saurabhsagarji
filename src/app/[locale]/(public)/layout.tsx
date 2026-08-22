import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { PageTransition } from '@/components/ui/page-transition';
import { MotionConfig } from 'framer-motion';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
