'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { WarmTexture } from '@/components/ui/warm-texture';
import { SpinBorder } from '@/components/ui/spin-border';
import { TiltCard } from '@/components/motion/tilt-card';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { formatEventDateRange } from '@/lib/event-dates';
import type { PublicEvent } from '@/lib/events';
import type { Language } from '@/lib/site-content';

export function HomeEventBanner({ event, lang }: { event: PublicEvent; lang: Language }) {
  const title = lang === 'en' && event.title_en ? event.title_en : event.title_hi;
  const dateLocale = lang === 'en' ? 'en-US' : 'hi-IN';
  const day = new Date(event.start_datetime).toLocaleDateString(dateLocale, { day: 'numeric' });
  const month = new Date(event.start_datetime).toLocaleDateString(dateLocale, { month: 'short' });

  return (
    <section className="relative overflow-hidden bg-sand/50 px-6 py-24 [perspective:1600px]">
      <WarmTexture />
      <div className="relative mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center gap-3"
        >
          <span className="font-serif-en text-sm tracking-[0.3em] text-gold-600">02</span>
          <span className="h-px w-8 bg-gold-500/50" aria-hidden="true" />
          <span className="font-serif text-sm uppercase tracking-[0.2em] text-gold-600">
            {lang === 'en' ? 'Upcoming' : 'आगामी'}
          </span>
        </motion.div>

        {/* Card flips down into place like a ticket being laid on a table. */}
        <motion.div
          initial={{ opacity: 0, rotateX: -18, y: 50 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <TiltCard max={4}>
            <SpinBorder
              className="rounded-[2rem] shadow-2xl"
              gradient="conic-gradient(from 0deg, var(--color-gold-500), transparent 30%, var(--color-gold-500) 60%, transparent 90%)"
            >
              <div className="flex flex-col items-center overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-to-br from-ivory via-ivory to-sand/60 text-center sm:flex-row sm:text-left">
                <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-8 py-8 sm:py-10">
                  <span className="font-serif text-5xl leading-none text-maroon-800">{day}</span>
                  <span className="font-serif-en text-xs uppercase tracking-[0.2em] text-gold-600">{month}</span>
                </div>
                {/* perforated ticket-stub divider */}
                <div
                  className="hidden h-32 w-px shrink-0 self-center sm:block"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, var(--color-gold-500) 0 6px, transparent 6px 14px)',
                  }}
                  aria-hidden="true"
                />
                <div className="flex-1 px-8 pb-10 pt-2 sm:py-10">
                  <h3 className="font-serif text-2xl leading-snug text-maroon-800 sm:text-3xl">{title}</h3>
                  <p className="mt-2 font-serif text-base text-gold-600">
                    {formatEventDateRange(event.start_datetime, event.end_datetime, lang)}
                  </p>
                  {event.venue_name && <p className="mt-1 text-sm text-neutral-600">{event.venue_name}</p>}
                  <MagneticButton className="mt-6">
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 rounded-full bg-maroon-800 px-7 py-3 font-serif-en text-sm font-medium text-ivory shadow-sm transition-colors hover:bg-maroon-900"
                    >
                      {lang === 'en' ? 'View details' : 'विवरण देखें'} →
                    </Link>
                  </MagneticButton>
                </div>
              </div>
            </SpinBorder>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
