import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LanguageToggle } from '@/components/ui/language-toggle';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
      <LanguageToggle />
    </>
  );
}
