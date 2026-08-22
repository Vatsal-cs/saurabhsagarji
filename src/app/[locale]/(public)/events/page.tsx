import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { getUpcomingEvent, getPastEvents } from '@/lib/events';
import { formatEventDateRange } from '@/lib/event-dates';
import { Reveal } from '@/components/ui/reveal';
import { SoberTexture } from '@/components/ui/sober-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger';
import { TiltCard } from '@/components/motion/tilt-card';

export const metadata = { title: 'Events' };

type Props = { params: Promise<{ locale: string }> };

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'hi';
  const [upcoming, past, t] = await Promise.all([
    getUpcomingEvent(),
    getPastEvents(),
    getTranslations({ locale, namespace: 'ComingSoon' }),
  ]);

  return (
    <main className="relative min-h-full overflow-hidden bg-ivory">
      <SoberTexture />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {t('events')}
            </p>
            <SplitHeadline
              as="h1"
              text={
                lang === 'en'
                  ? 'In the Sacred Presence of Param Pujya Gurudev: Grand Celebrations'
                  : 'परम पूज्य गुरुदेव के पावन सानिध्य में: भव्य समारोह'
              }
              className="mt-3 font-serif text-2xl leading-snug tracking-tight text-maroon-800 sm:text-3xl md:text-4xl"
            />
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </Reveal>

          {/* Featured upcoming event — animated gold border, tilt on hover */}
          {upcoming && (
            <Reveal delay={100} className="mx-auto mt-14 max-w-2xl">
              <TiltCard max={6}>
                <div
                  className="animate-spin-border rounded-3xl p-[2px] shadow-xl"
                  style={{
                    backgroundImage:
                      'conic-gradient(from var(--border-angle), var(--color-gold-500), transparent 30%, var(--color-gold-500) 60%, transparent 90%)',
                  }}
                >
                  <div className="rounded-[calc(1.5rem-2px)] bg-gradient-to-b from-ivory to-sand/70 p-8 sm:p-10">
                    <span className="inline-flex items-center rounded-full bg-gold-500 px-3 py-1 text-xs font-medium uppercase tracking-wide text-maroon-900 shadow">
                      {lang === 'en' ? 'Upcoming' : 'आगामी'}
                    </span>

                    <h2 className="mt-4 font-serif text-2xl leading-snug text-maroon-800 sm:text-3xl">
                      {lang === 'en' && upcoming.title_en ? upcoming.title_en : upcoming.title_hi}
                    </h2>

                    <p className="mt-3 font-serif text-base text-gold-600">
                      {formatEventDateRange(upcoming.start_datetime, upcoming.end_datetime, lang)}
                    </p>

                    {upcoming.venue_name && (
                      <p className="mt-2 text-sm text-neutral-600">
                        {upcoming.venue_name}
                        {upcoming.venue_address ? `, ${upcoming.venue_address}` : ''}
                      </p>
                    )}

                    {(lang === 'en' ? upcoming.description_en : upcoming.description_hi) && (
                      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                        {lang === 'en' ? upcoming.description_en : upcoming.description_hi}
                      </p>
                    )}

                    {upcoming.venue_map_url && (
                      <a
                        href={upcoming.venue_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block rounded-full border border-gold-500 px-5 py-2 text-sm font-medium text-maroon-800 transition-colors hover:bg-gold-400/10"
                      >
                        {lang === 'en' ? 'View on map' : 'में देखें'} →
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          )}

          {/* Past events grid */}
          {past.length > 0 && (
            <div className="mt-16">
              <Reveal>
                <h2 className="text-center font-serif text-2xl text-maroon-800 sm:text-3xl">
                  {lang === 'en' ? 'Past Events' : 'पिछले समारोह'}
                </h2>
              </Reveal>
              <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {past.map((event) => (
                  <StaggerItem key={event.id}>
                    <div className="group overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02] transition-shadow hover:shadow-[0_16px_40px_-12px_rgba(88,10,45,0.35)]">
                      <div className="relative aspect-video overflow-hidden bg-neutral-900">
                        {event.youtube_video_id ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${event.youtube_video_id}`}
                            title={lang === 'en' && event.title_en ? event.title_en : event.title_hi}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : event.cover_image_url ? (
                          <Image
                            src={event.cover_image_url}
                            alt={lang === 'en' && event.title_en ? event.title_en : event.title_hi}
                            fill
                            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 45vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-maroon-800 via-maroon-900 to-ink">
                            <span className="text-3xl text-gold-400/60">☸</span>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <h3 className="font-serif text-base text-neutral-900">
                          {lang === 'en' && event.title_en ? event.title_en : event.title_hi}
                        </h3>
                        <p className="mt-1 text-xs text-gold-600">
                          {formatEventDateRange(event.start_datetime, event.end_datetime, lang)}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          )}

          {!upcoming && past.length === 0 && (
            <Reveal className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-ivory/60 p-12 text-center">
              <p className="font-serif text-lg text-maroon-800">
                {lang === 'en' ? 'No events available yet' : 'कोई समारोह उपलब्ध नहीं है'}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </main>
  );
}
