import { getSiteContentBatch } from '@/lib/site-content';

const HOME_KEYS = [
  'home_hero_headline',
  'home_hero_subtitle',
  'home_welcome_heading',
  'home_welcome_body',
  'home_quote_text',
] as const;

export async function generateMetadata() {
  const content = await getSiteContentBatch(['site_name', 'site_tagline']);
  return {
    title: `${content.site_name} — ${content.site_tagline}`,
    description: content.site_tagline,
  };
}

export default async function HomePage() {
  const content = await getSiteContentBatch(HOME_KEYS);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero */}
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {content.home_hero_headline}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            {content.home_hero_subtitle}
          </p>
        </div>
      </section>

      {/* Welcome */}
      <section className="border-t border-neutral-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {content.home_welcome_heading}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-700 sm:text-lg">
            {content.home_welcome_body}
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote className="font-serif text-2xl italic leading-relaxed text-neutral-800 sm:text-3xl">
            &ldquo;{content.home_quote_text}&rdquo;
          </blockquote>
        </div>
      </section>
    </main>
  );
}