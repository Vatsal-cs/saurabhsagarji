'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { WarmTexture } from '@/components/ui/warm-texture';
import { AmbientGlow } from '@/components/ui/ambient-glow';
import { SpinBorder } from '@/components/ui/spin-border';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { renderBoldText } from '@/lib/render-bold-text';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';
import type { PublicAboutSection } from '@/lib/about';
import type { Language } from '@/lib/site-content';

export function HomeAboutPreview({
  section,
  lang,
}: {
  section: PublicAboutSection;
  lang: Language;
}) {
  const title = lang === 'en' && section.title_en ? section.title_en : section.title_hi;
  const intro = lang === 'en' && section.intro_en ? section.intro_en : section.intro_hi;
  const photo = section.photo_1_url ?? section.photo_2_url;

  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  // The card "develops" in stages rather than just fading up as one block:
  // the frame settles into place first, then the photo wipes into view like
  // a curtain opening, then the text lines stagger in — driven by a single
  // plain IntersectionObserver flag and pure CSS transitions (no animation
  // library in the loop for the entrance itself, just `revealed` toggling
  // Tailwind classes) so there's nothing framework-specific that can quietly
  // fail to trigger.
  const { ref, inView: revealed } = useInView<HTMLDivElement>(0.2);

  return (
    <section className="relative overflow-hidden bg-ivory py-16 sm:py-24">
      <WarmTexture />
      <AmbientGlow />

      <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
        {/* Rectangular card with the same animated conic-gradient border technique
            as the event banner, plus a glossy light sweep layered on top so the
            whole card feels alive, not just its edge. */}
        <div
          ref={ref}
          className={cn(
            'shadow-[0_45px_90px_-30px_rgba(88,10,45,0.65)] transition-all duration-700 ease-out',
            revealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-9 scale-95 opacity-0'
          )}
        >
          <SpinBorder>
          <div className="relative flex overflow-hidden bg-gradient-to-br from-ivory via-ivory to-sand/60">
            {/* Gilt corner brackets on the card frame — an ornamental "sealed
                manuscript" touch instead of the plain rectangle the flat
                cream panel otherwise reads as. */}
            <CornerBracket className="left-2 top-2 border-l-2 border-t-2" />
            <CornerBracket className="right-2 top-2 border-r-2 border-t-2" />
            <CornerBracket className="bottom-2 left-2 border-b-2 border-l-2" />
            <CornerBracket className="bottom-2 right-2 border-b-2 border-r-2" />

            {/* A faint lotus-mandala watermark grounds the otherwise-empty
                cream expanse of the text panel — pure line art, low enough
                opacity to read as texture rather than compete with the
                title/button. */}
            <LotusWatermark className="pointer-events-none absolute -bottom-10 -right-10 z-0 h-56 w-56 text-gold-500/[0.08] sm:h-72 sm:w-72" />

            {photo && (
              <div
                className="relative w-28 shrink-0 self-stretch overflow-hidden transition-[clip-path] duration-700 ease-out sm:w-64 md:w-80"
                style={{
                  transitionDelay: '250ms',
                  clipPath: revealed ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                }}
              >
                <div ref={imgRef} className="absolute inset-0">
                  <motion.div style={{ scale }} className="absolute inset-0">
                    <Image
                      src={photo}
                      alt={title}
                      fill
                      sizes="(min-width: 640px) 320px, 112px"
                      className="object-cover"
                    />
                  </motion.div>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-maroon-950/10" />

                {/* Seam ornament — marks the photo/text join with the same
                    gold flower glyph used as a divider elsewhere on the site,
                    instead of a bare hard edge. */}
                <div
                  className="pointer-events-none absolute -right-3 top-1/2 z-30 hidden -translate-y-1/2 sm:flex sm:flex-col sm:items-center sm:gap-1.5"
                  aria-hidden="true"
                >
                  <span className="h-8 w-px bg-gradient-to-b from-transparent to-gold-500/70" />
                  <span className="text-xs text-gold-500">❁</span>
                  <span className="h-8 w-px bg-gradient-to-t from-transparent to-gold-500/70" />
                </div>
              </div>
            )}

            <div
              className={`relative z-10 flex min-w-0 flex-col justify-center px-4 py-6 sm:px-10 sm:py-10 ${photo ? '' : 'items-center text-center'}`}
            >
              <h2
                className={cn(
                  'text-balance font-serif text-xl leading-tight text-maroon-800 transition-all duration-500 ease-out sm:text-4xl',
                  revealed ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                )}
                style={{ transitionDelay: '350ms' }}
              >
                {title}
              </h2>

              {intro && (
                <p
                  className={cn(
                    'relative mt-4 max-w-xl font-serif text-sm leading-relaxed text-neutral-800 transition-all duration-500 ease-out sm:mt-6 sm:text-xl',
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                  )}
                  style={{ transitionDelay: '450ms' }}
                >
                  {renderBoldText(intro)}
                </p>
              )}

              <div
                className={cn(
                  `mt-4 sm:mt-8 ${photo ? 'self-start' : ''} transition-all duration-500 ease-out`,
                  revealed ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                )}
                style={{ transitionDelay: '550ms' }}
              >
                <MagneticButton className="inline-block">
                  <Link
                    href={`/about/${section.slug}`}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-maroon-800 px-5 py-2.5 font-serif-en text-xs font-medium text-ivory shadow-md transition-colors hover:bg-maroon-900 sm:gap-2 sm:px-8 sm:py-3.5 sm:text-sm"
                  >
                    {lang === 'en' ? 'Begin Reading' : 'पूरी कथा पढ़ें'}
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
          </SpinBorder>
        </div>
      </div>
    </section>
  );
}

function CornerBracket({ className }: { className: string }) {
  return (
    <span
      className={cn('pointer-events-none absolute z-20 h-5 w-5 border-gold-400/80', className)}
      aria-hidden="true"
    />
  );
}

/** Purely decorative line-art lotus medallion, drawn once and reused as a
 * low-opacity corner watermark — no external asset, so its color always
 * matches the card exactly. */
function LotusWatermark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5">
        <circle cx="100" cy="100" r="72" />
        <circle cx="100" cy="100" r="48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="58"
            rx="15"
            ry="36"
            transform={`rotate(${i * 45} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="10" />
      </g>
    </svg>
  );
}
