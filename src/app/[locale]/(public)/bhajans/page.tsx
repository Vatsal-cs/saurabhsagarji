import { getTranslations } from 'next-intl/server';
import { getPublishedBhajans } from '@/lib/bhajans';
import { Reveal } from '@/components/ui/reveal';
import { WarmTexture } from '@/components/ui/warm-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger';

export const metadata = { title: 'Bhajans' };

type Props = { params: Promise<{ locale: string }> };

export default async function BhajansPage({ params }: Props) {
  const { locale } = await params;
  const bhajans = await getPublishedBhajans();
  const t = await getTranslations({ locale, namespace: 'ComingSoon' });

  return (
    <main className="relative overflow-hidden bg-ivory">
      <WarmTexture />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {t('bhajans')}
            </p>
            <SplitHeadline
              as="h1"
              text={locale === 'en' ? 'Bhajans' : 'भजन'}
              className="mt-3 font-serif text-4xl leading-tight tracking-tight text-maroon-800 sm:text-5xl"
            />
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </Reveal>

          {bhajans.length === 0 ? (
            <Reveal className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-ivory/60 p-12 text-center">
              <p className="font-serif text-lg text-maroon-800">
                {locale === 'en' ? 'No bhajans available yet' : 'कोई भजन उपलब्ध नहीं है'}
              </p>
            </Reveal>
          ) : (
            <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bhajans.map((bhajan) => (
                <StaggerItem key={bhajan.id}>
                  <div className="group overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:shadow-[0_16px_40px_-12px_rgba(88,10,45,0.35)]">
                    <div className="aspect-video overflow-hidden bg-neutral-900">
                      <iframe
                        src={`https://www.youtube.com/embed/${bhajan.youtube_video_id}`}
                        title="Bhajan"
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    </main>
  );
}
