import { notFound } from 'next/navigation';
import { getPublishedAboutSectionBySlug, getPublishedAboutSectionsStatic } from '@/lib/about';
import { Reveal } from '@/components/ui/reveal';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const sections = await getPublishedAboutSectionsStatic();
  return sections.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = await getPublishedAboutSectionBySlug(slug);
  if (!section) return { title: 'Not found' };
  return {
    title: section.title_en ?? section.title_hi,
    description: section.intro_en ?? section.intro_hi ?? undefined,
  };
}

export default async function AboutSectionPage({ params }: Props) {
  const { locale, slug } = await params;
  const section = await getPublishedAboutSectionBySlug(slug);
  if (!section) notFound();

  const title = locale === 'en' && section.title_en ? section.title_en : section.title_hi;
  const intro = locale === 'en' && section.intro_en ? section.intro_en : section.intro_hi;
  const body = locale === 'en' && section.body_en ? section.body_en : section.body_hi;

  return (
    <main className="bg-ivory">
      {/* Hero band — photo shown whole, blurred backdrop, title below */}
      <section className="relative w-full overflow-hidden bg-neutral-900">
        {section.photo_1_url ? (
          <div className="relative">
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-2xl"
              style={{ backgroundImage: `url(${section.photo_1_url})` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

            <div className="relative flex max-h-[70vh] min-h-[280px] items-center justify-center px-6 py-10 sm:py-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.photo_1_url}
                alt={title}
                className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-crimson-900 via-crimson-800 to-ink" />
        )}

        <div className="relative bg-gradient-to-b from-black/40 to-crimson-900 px-6 pb-10 pt-2 text-center sm:pb-14">
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-gold-400 sm:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-gold-400/60" />
            <span className="text-gold-400/80">❁</span>
            <span className="h-px w-10 bg-gold-400/60" />
          </div>
        </div>
      </section>

      {/* Asymmetric body — photo 2 as a generous filling frame, next to biography */}
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-10 sm:grid-cols-[1fr_1.3fr] sm:gap-14">
          {section.photo_2_url && (
            <Reveal className="w-full">
              <div className="relative flex min-h-[320px] items-center justify-center rounded-2xl border-2 border-gold-500/50 bg-sand/40 p-4 shadow-xl sm:min-h-[440px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.photo_2_url}
                  alt={title}
                  className="max-h-[560px] w-auto max-w-full rounded-lg object-contain"
                />
              </div>
            </Reveal>
          )}

          <Reveal delay={150} className={section.photo_2_url ? '' : 'sm:col-span-2 sm:mx-auto sm:max-w-2xl'}>
            {intro && (
              <p className="font-serif text-xl italic leading-relaxed text-gold-600 sm:text-2xl">
                {intro}
              </p>
            )}
            {body && (
              <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-800 sm:text-lg">
                {body.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </main>
  );
}
