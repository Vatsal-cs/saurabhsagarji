import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import {
  getPublishedAboutSectionBySlug,
  getPublishedAboutSections,
  getPublishedAboutSectionsStatic,
} from '@/lib/about';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/reveal';
import { OrnamentDivider } from '@/components/ui/ornament-divider';
import { WarmTexture } from '@/components/ui/warm-texture';
import { AmbientGlow } from '@/components/ui/ambient-glow';
import { SplitHeadline } from '@/components/motion/split-headline';
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger';
import { TiltCard } from '@/components/motion/tilt-card';
import { Parallax } from '@/components/motion/parallax';
import { ScrollAccentLine } from '@/components/motion/scroll-accent-line';
import { renderBoldText } from '@/lib/render-bold-text';
import { AboutVideoCard } from '../about-video-card';
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
  const [section, allSections] = await Promise.all([
    getPublishedAboutSectionBySlug(slug),
    getPublishedAboutSections(),
  ]);
  if (!section) notFound();

  const title = locale === 'en' && section.title_en ? section.title_en : section.title_hi;
  const intro = locale === 'en' && section.intro_en ? section.intro_en : section.intro_hi;
  const body = locale === 'en' && section.body_en ? section.body_en : section.body_hi;
  const otherSections = allSections.filter((s) => s.slug !== slug);
  const photos = [section.photo_1_url, section.photo_2_url].filter((url): url is string => Boolean(url));

  // A line starting with "## " breaks the biography into a titled section —
  // set from the admin form's Heading toggle. Everything else is body text.
  // Lines are trimmed and blank ones dropped so a stray blank line left over
  // from pasted text (very common — most editors insert one between
  // paragraphs) doesn't render as an empty paragraph and steal the drop cap.
  const bodyBlocks = (body ? body.split('\n').map((l) => l.trim()).filter(Boolean) : []).map((line) => {
    return line.startsWith('## ')
      ? { type: 'heading' as const, text: line.slice(3).trim() }
      : { type: 'text' as const, text: line };
  });
  const textIndexes = bodyBlocks.reduce<number[]>((acc, b, i) => {
    if (b.type === 'text') acc.push(i);
    return acc;
  }, []);
  const firstTextIndex = textIndexes[0];
  const floatAtIndex =
    textIndexes.length > 0
      ? textIndexes[Math.min(textIndexes.length - 1, Math.max(1, Math.floor(textIndexes.length / 2)))] ??
        firstTextIndex
      : -1;

  return (
    <main className="relative overflow-hidden bg-ivory">
      {/* Header — oversized title over a faint drifting glyph */}
      <div className="relative overflow-hidden px-6 pb-10 pt-16 text-center sm:px-8 sm:pb-14 sm:pt-24">
        <WarmTexture />

        <div className="relative">
          <Reveal>
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {locale === 'en' ? 'About' : 'परिचय'}
            </p>
          </Reveal>
          <SplitHeadline
            as="h1"
            text={title}
            className="relative mx-auto mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-maroon-800 sm:text-6xl md:text-7xl"
          />
          <Reveal delay={200}>
            <OrnamentDivider className="mx-auto mt-7" />
          </Reveal>
        </div>
      </div>

      {/* Body — a book-page layout: photo 1 floats beside the opening text, photo 2 floats mid-text on the right */}
      <div className="relative overflow-hidden">
        <WarmTexture />
        <AmbientGlow />
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-10 pb-20 sm:px-8 sm:pt-14 sm:pb-28">
          {photos[0] && (
            <Reveal className="mb-6 w-full sm:float-left sm:mr-8 sm:w-72 md:w-80">
              <Parallax speed={-0.06}>
                <TiltCard max={6}>
                  <div className="overflow-hidden border-4 border-gold-500 shadow-[0_16px_40px_-14px_rgba(88,10,45,0.5)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[0]} alt={title} className="block h-auto w-full" />
                  </div>
                </TiltCard>
              </Parallax>
            </Reveal>
          )}

          {intro && (
            <Reveal>
              <p className="relative text-left font-serif text-2xl leading-[1.5] tracking-[0.005em] text-gold-700 italic sm:text-3xl">
                <span aria-hidden="true" className="mr-1 font-serif text-5xl not-italic text-gold-400/70">
                  &ldquo;
                </span>
                {renderBoldText(intro)}
                <span aria-hidden="true" className="ml-0.5 font-serif text-5xl not-italic text-gold-400/70">
                  &rdquo;
                </span>
              </p>
            </Reveal>
          )}

          {bodyBlocks.length > 0 && (
            <ScrollAccentLine className="mt-10">
              <div className="text-left font-serif text-lg leading-relaxed text-neutral-800 sm:text-xl">
                {bodyBlocks.map((block, i) => (
                  <Fragment key={i}>
                    {i === floatAtIndex && photos[1] && (
                      <Reveal className="mb-6 w-full sm:float-right sm:mb-8 sm:ml-10 sm:w-[63%] sm:min-w-[240px] sm:max-w-[420px]">
                        <Parallax speed={-0.1}>
                          <TiltCard max={6}>
                            <div className="overflow-hidden border-4 border-gold-500 shadow-[0_16px_40px_-14px_rgba(88,10,45,0.5)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photos[1]} alt={title} className="block h-auto w-full" />
                            </div>
                          </TiltCard>
                        </Parallax>
                      </Reveal>
                    )}
                    {block.type === 'heading' ? (
                      <Reveal className="mt-12 mb-5 first:mt-0">
                        <span aria-hidden="true" className="mb-3 block h-[3px] w-12 bg-gradient-to-r from-gold-500 to-gold-400/30" />
                        <h2 className="font-serif text-3xl font-bold leading-tight text-maroon-800 sm:text-4xl">
                          {renderBoldText(block.text)}
                        </h2>
                      </Reveal>
                    ) : (
                      <Reveal>
                        <p
                          className={
                            'mb-6 ' +
                            (i === firstTextIndex
                              ? 'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-maroon-800 sm:first-letter:text-7xl'
                              : '')
                          }
                        >
                          {renderBoldText(block.text)}
                        </p>
                      </Reveal>
                    )}
                  </Fragment>
                ))}
              </div>
            </ScrollAccentLine>
          )}
        </div>
      </div>

      {/* Related videos — hover a card to preview it inline, or tap through to
          watch on YouTube. Sits at the bottom of the jivni's own content, before
          the cross-links to other sections. */}
      {section.videos.length > 0 && (
        <div className="relative overflow-hidden">
          <WarmTexture />
          <div className="relative mx-auto w-full max-w-3xl px-6 pb-20 sm:px-8 sm:pb-28">
            <Reveal>
              <span aria-hidden="true" className="mb-3 block h-[3px] w-12 bg-gradient-to-r from-gold-500 to-gold-400/30" />
              <h2 className="font-serif text-2xl font-bold text-maroon-800 sm:text-3xl">
                {locale === 'en' ? 'Watch' : 'देखें'}
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {section.videos.map((video) => (
                <Reveal key={video.id}>
                  <AboutVideoCard videoId={video.youtube_video_id} label={title} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continue exploring — cross-links to the other about sections */}
      {otherSections.length > 0 && (
        <section className="relative overflow-hidden bg-sand/50 px-6 py-20 sm:px-8 sm:py-24">
          <WarmTexture />
          <div className="relative mx-auto max-w-6xl">
            <Reveal>
              <OrnamentDivider className="mb-4" />
              <h2 className="text-center font-serif text-3xl text-maroon-800 sm:text-4xl">
                {locale === 'en' ? 'Continue exploring' : 'और जानें'}
              </h2>
            </Reveal>
            <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {otherSections.map((s) => {
                const otherTitle = locale === 'en' && s.title_en ? s.title_en : s.title_hi;
                return (
                  <StaggerItem key={s.slug} className="h-full">
                    <TiltCard max={8} className="h-full">
                      <Link
                        href={`/about/${s.slug}`}
                        className="group relative block h-full overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-b from-ivory to-sand/70 p-7 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.18)] transition-all hover:border-gold-500 hover:shadow-[0_16px_40px_-12px_rgba(88,10,45,0.3)]"
                      >
                        <span className="text-3xl text-gold-500">❁</span>
                        <h3 className="mt-4 font-serif text-xl text-maroon-800">{otherTitle}</h3>
                        <span className="mt-5 inline-block font-serif-en text-sm text-maroon-800 transition-transform group-hover:translate-x-1">
                          {locale === 'en' ? 'Read' : 'पढ़ें'} →
                        </span>
                      </Link>
                    </TiltCard>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      )}
    </main>
  );
}
