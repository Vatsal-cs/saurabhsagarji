'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { onLayoutSettled } from '@/lib/dom-ready';
import { cn } from '@/lib/cn';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/** "Divine Focus" — a slow camera-focus reveal: the portrait holds soft and
 * de-focused for a beat, then sharpens and grows into a pronounced overshoot,
 * holds there for a beat, then settles to its resting size. */
const photoReveal: Variants = {
  hidden: { opacity: 0, scale: 0.84, filter: 'blur(10px)' },
  show: {
    opacity: [0, 0, 1, 1, 1],
    scale: [0.84, 0.84, 1.18, 1.18, 1],
    filter: ['blur(10px)', 'blur(10px)', 'blur(2px)', 'blur(0px)', 'blur(0px)'],
    transition: {
      duration: 2.6,
      times: [0, 0.115, 0.423, 0.808, 1],
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function HomeHero({ headline, subtitle }: { headline: string; subtitle?: string }) {
  const t = useTranslations('Home');
  const portraitRef = useRef<HTMLImageElement>(null);
  const [isPortraitReady, setIsPortraitReady] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(false);

  // The shimmer sweep animates `background-position`, which forces a repaint
  // every frame — fine for a few seconds, wasteful running forever on a name
  // that's often scrolled out of view. Only run it while the headline is
  // actually on screen; toggles both ways (unlike a one-shot reveal), so it
  // stops the moment it scrolls past and resumes if scrolled back.
  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    let observer: IntersectionObserver | undefined;

    const cancelSettle = onLayoutSettled(() => {
      observer = new IntersectionObserver(([entry]) => setIsHeadlineVisible(entry.isIntersecting), {
        threshold: 0.3,
      });
      observer.observe(el);
    });

    return () => {
      cancelSettle();
      observer?.disconnect();
    };
  }, []);

  // The cinematic entrance only plays at the min-[900px] desktop layout; on
  // mobile/tablet the photo just appears immediately (zero-duration
  // transition, applied via a prop override rather than branching the
  // initial/animate variant names — the latter would render differently
  // server- vs client-side, since `window` isn't available during SSR, and
  // React won't patch up a mismatched inline style after hydration). A
  // `transition` override doesn't affect the initial rendered style, only
  // how it animates post-mount, so it's safe to read synchronously here.
  const [skipPhotoAnimation] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900
  );

  // `onLoad` handles a network load. The `complete` check covers a browser
  // cache hit, where the image may already be decoded before React attaches
  // the event listener during hydration.
  useEffect(() => {
    const portrait = portraitRef.current;
    if (portrait?.complete && portrait.naturalWidth > 0) {
      setIsPortraitReady(true);
    }
  }, []);

  return (
    <div className="relative px-2 pt-9 pb-2 min-[640px]:px-6 min-[640px]:pt-16 min-[640px]:pb-3 min-[900px]:pt-0 min-[900px]:pb-0">
      {/* Just the guru photo, name, and subtitle now — the side statue portraits moved up
          into HomeMangalacharan so they share a line with the invocation verse instead. A
          plain centered flex column is enough now that there's no side content to align
          against. Below min-[900px], the photo sits in normal flow (no pull-up transform) —
          its photoReveal zoom overshoots to ~1.18x scale mid-entrance, and that overshoot
          needs real flow space on both sides of the photo's resting box, not just a visual
          transform, or it dips into the statues above or the name below. The extra top
          padding on this wrapper and the small positive margin above the name are that
          real space. At min-[900px] and up the photo is pulled up hard with a transform
          instead (the desktop layout intentionally overlaps the photo into the marquee
          above it), and the name uses a large negative margin to sit close beneath it. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-6xl flex-col items-center"
      >
        <div className="relative shrink-0 -translate-y-11 drop-shadow-2xl min-[900px]:-translate-y-27">
          {/* The source photo has ~11% dead transparent space below the
              figure (and ~4% above) baked into the file itself — no amount
              of margin/positioning below can close that, since object-contain
              faithfully preserves it. The crop lives on a fixed-size
              overflow-hidden box *inside* the Framer-animated wrapper (not
              outside it) — the reveal/zoom animation still scales the whole
              already-cropped result freely, same as before; only the dead
              space itself gets clipped away. drop-shadow lives on the
              outermost div here rather than the animated one below, since
              Framer writes its own `filter: blur(...)` inline style during
              the reveal, which would otherwise silently override/hide a
              drop-shadow filter class on the same element. */}
          <motion.div
            variants={photoReveal}
            initial="hidden"
            animate={isPortraitReady ? 'show' : 'hidden'}
            transition={skipPhotoAnimation ? { duration: 0 } : undefined}
          >
            <div className="h-[24rem] w-[24rem] overflow-hidden sm:h-[27rem] sm:w-[27rem] md:h-[32rem] md:w-[32rem] lg:h-[38rem] lg:w-[38rem]">
              <div className="h-full w-full origin-top scale-[1.122]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={portraitRef}
                  onLoad={() => setIsPortraitReady(true)}
                  src="/guruji-portrait-sitting.webp"
                  alt={t('portraitAlt')}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-0 min-[768px]:mt-2 min-[900px]:-mt-14">
          <motion.h1
            ref={headlineRef}
            variants={fadeUp}
            className={cn(
              'mx-auto max-w-3xl text-center text-balance font-serif text-lg leading-tight tracking-tight sm:text-2xl md:text-3xl',
              isHeadlineVisible ? 'animate-yellow-shimmer' : 'text-gold-400'
            )}
          >
            {headline}
          </motion.h1>
        </div>

        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-center font-serif-en text-base leading-relaxed text-ivory/65 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
