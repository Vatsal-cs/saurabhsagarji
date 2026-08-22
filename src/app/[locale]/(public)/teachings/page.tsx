import { getTranslations } from 'next-intl/server';
import { getLatestChannelVideos, getLiveChannelVideo } from '@/lib/youtube';
import { YOUTUBE_CHANNEL_URL, YOUTUBE_SHORTS_URL, INSTAGRAM_URL } from '@/lib/social-links';
import { Reveal } from '@/components/ui/reveal';
import { SoberTexture } from '@/components/ui/sober-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger';

export const metadata = { title: 'Discourses' };

type Props = { params: Promise<{ locale: string }> };

export default async function TeachingsPage({ params }: Props) {
  const { locale } = await params;
  const [videos, liveVideo] = await Promise.all([getLatestChannelVideos(8), getLiveChannelVideo()]);
  const t = await getTranslations({ locale, namespace: 'Teachings' });
  const tComingSoon = await getTranslations({ locale, namespace: 'ComingSoon' });
  const dateLocale = locale === 'en' ? 'en-US' : 'hi-IN';

  return (
    <main className="relative min-h-full overflow-hidden bg-ivory">
      <SoberTexture />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {tComingSoon('teachings')}
            </p>
            <SplitHeadline
              as="h1"
              text={locale === 'en' ? 'Discourses' : 'उपदेश'}
              className="mt-3 font-serif text-4xl leading-tight tracking-tight text-maroon-800 sm:text-5xl"
            />
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </Reveal>

          {liveVideo && (
            <Reveal className="mx-auto mt-12 max-w-4xl">
              <a
                href={`https://www.youtube.com/watch?v=${liveVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-ivory to-red-50/50 p-4 shadow-[0_8px_30px_-12px_rgba(200,20,20,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(200,20,20,0.4)] sm:flex-row sm:p-5"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-neutral-900 sm:w-72">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={liveVideo.thumbnailUrl}
                    alt={liveVideo.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <PlayGlyph />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ring-pulse rounded-full bg-white" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    {t('liveNow')}
                  </span>
                  <p className="mt-3 font-serif text-lg text-maroon-800 sm:text-xl">{liveVideo.title}</p>
                  <p className="mt-1 font-serif-en text-sm text-gold-600">{t('liveNowCta')} →</p>
                </div>
              </a>
            </Reveal>
          )}

          <div className="mt-14">
            <Reveal>
              <h2 className="text-center font-serif text-2xl text-maroon-800 sm:text-left">
                {t('latestVideos')}
              </h2>
            </Reveal>

            {videos.length === 0 ? (
              <Reveal className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-ivory/60 p-12 text-center">
                <p className="font-serif text-lg text-maroon-800">{t('noVideosTitle')}</p>
                <p className="mt-2 font-serif-en text-sm text-maroon-800/70">{t('noVideosBody')}</p>
              </Reveal>
            ) : (
              <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {videos.map((video) => (
                  <StaggerItem key={video.id}>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:shadow-[0_16px_40px_-12px_rgba(88,10,45,0.35)]"
                    >
                      <div className="relative aspect-video overflow-hidden bg-neutral-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                        <PlayGlyph />
                      </div>
                      <div className="px-4 py-3">
                        <p className="line-clamp-2 font-serif text-sm text-maroon-800">{video.title}</p>
                        <p className="mt-1 font-serif-en text-xs text-gold-600">
                          {new Date(video.publishedAt).toLocaleDateString(dateLocale, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}

            <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-maroon-800 px-6 py-3 font-serif-en text-sm font-medium text-ivory shadow-md transition-colors hover:bg-maroon-900"
              >
                <YoutubeGlyph className="h-4 w-4" />
                {t('visitChannel')}
              </a>
              <a
                href={YOUTUBE_SHORTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-6 py-3 font-serif-en text-sm font-medium text-maroon-800 transition-colors hover:border-gold-500 hover:bg-gold-500/10"
              >
                {t('watchShorts')}
              </a>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="relative border-t border-gold-500/20 bg-sand/40 py-16 sm:py-20">
        <div className="relative mx-auto w-full max-w-2xl px-6 text-center sm:px-8">
          <Reveal>
            <InstagramGlyph className="mx-auto h-10 w-10" />
            <h2 className="mt-4 font-serif text-2xl text-maroon-800">{t('instagramHeading')}</h2>
            <p className="mt-2 font-serif-en text-sm text-maroon-800/70">{t('instagramBody')}</p>
            <div className="mt-6">
              {INSTAGRAM_URL ? (
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-6 py-3 font-serif-en text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.03]"
                >
                  {t('instagramCta')}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-gold-500/40 px-6 py-3 font-serif-en text-sm font-medium text-maroon-800/50">
                  {t('comingSoon')}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

function PlayGlyph() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 shadow-lg">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-0.5 text-maroon-800">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}

function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7L15.8 12Z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="url(#ig-grad)" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="url(#ig-grad)" />
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="50%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#8134af" />
        </linearGradient>
      </defs>
    </svg>
  );
}
