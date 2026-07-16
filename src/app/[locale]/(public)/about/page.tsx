import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';

const ABOUT_KEYS = [
  'about_page_heading',
  'about_biography',
  'about_mission',
  'about_philosophy',
] as const;

export const metadata = {
  title: 'About',
};

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const c = await getSiteContentBatch(ABOUT_KEYS, lang);
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <Container>
      <article className="py-20">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            {c.about_page_heading}
          </h1>
        </header>

        <section className="mx-auto max-w-2xl space-y-8 text-lg leading-relaxed text-neutral-800">
          <p>{c.about_biography}</p>

          <div className="border-l-2 border-saffron-400 pl-6">
            <h2 className="mb-2 font-serif text-sm uppercase tracking-widest text-neutral-500">
              {t('mission')}
            </h2>
            <p>{c.about_mission}</p>
          </div>

          <div className="border-l-2 border-saffron-400 pl-6">
            <h2 className="mb-2 font-serif text-sm uppercase tracking-widest text-neutral-500">
              {t('philosophy')}
            </h2>
            <p>{c.about_philosophy}</p>
          </div>
        </section>
      </article>
    </Container>
  );
}
