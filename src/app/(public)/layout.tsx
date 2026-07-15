import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { getLanguage } from '@/lib/language';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();

  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <LanguageToggle current={lang} />
    </>
  );
}
