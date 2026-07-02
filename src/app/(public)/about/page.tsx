import { Container } from '@/components/ui/container';
import { getSiteContentBatch } from '@/lib/site-content';

const ABOUT_KEYS = [
  'about_page_heading',
  'about_biography',
  'about_mission',
  'about_philosophy',
] as const;

export const metadata = {
  title: 'About',
};

export default async function AboutPage() {
  const c = await getSiteContentBatch(ABOUT_KEYS);

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
              मिशन / Mission
            </h2>
            <p>{c.about_mission}</p>
          </div>

          <div className="border-l-2 border-saffron-400 pl-6">
            <h2 className="mb-2 font-serif text-sm uppercase tracking-widest text-neutral-500">
              दर्शन / Philosophy
            </h2>
            <p>{c.about_philosophy}</p>
          </div>
        </section>
      </article>
    </Container>
  );
}