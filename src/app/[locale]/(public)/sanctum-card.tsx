'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { renderBoldText } from '@/lib/render-bold-text';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

/** Shared framed-photograph card — photo up top, eyebrow/title/quote/badge and a
 * capsule "Learn more" button below. Used side-by-side (Manshapuran Mahavir /
 * Jeevanasha Hospital) on the homepage hero canvas. Everything reveals on scroll
 * via a plain IntersectionObserver + CSS transitions (see useInView) — the photo
 * settles into place first, then the text lines stagger in underneath it. */
export function SanctumCard({
  photo,
  photoAspect,
  eyebrow,
  title,
  quote,
  badge,
  href,
  linkLabel,
}: {
  photo: string | null;
  photoAspect: string;
  eyebrow: string;
  title: string;
  quote?: string | null;
  badge?: string | null;
  href: string;
  linkLabel: string;
}) {
  const { ref, inView: revealed } = useInView<HTMLDivElement>(0.2);

  return (
    <div ref={ref} className="text-left">
      {photo && (
        <div
          className={cn(
            'relative mx-auto mb-6 w-full max-w-xs transition-all duration-700 ease-out',
            revealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'
          )}
        >
          <div className="absolute -inset-3 rounded-2xl bg-gold-400/20 blur-xl" aria-hidden="true" />
          <div
            className={`relative ${photoAspect} overflow-hidden rounded-xl border-2 border-gold-400/70 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.8)]`}
          >
            <Image src={photo} alt={title} fill sizes="(min-width: 640px) 320px, 90vw" className="object-cover" />
            <div
              className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gold-200/30"
              aria-hidden="true"
            />
          </div>
          {/* Gilt corner brackets — a framed-photograph feel in place of the
              temple-niche arch, which squeezed these landscape building shots. */}
          <span
            className="pointer-events-none absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-gold-400"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-gold-400"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-gold-400"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-gold-400"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="min-w-0">
        <p
          className={cn(
            'font-serif text-xs uppercase tracking-[0.1em] text-gold-400 transition-all duration-500 ease-out',
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: revealed ? '0ms' : '150ms' }}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            'mt-1 font-serif text-lg leading-snug text-ivory transition-all duration-500 ease-out sm:text-xl',
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: revealed ? '0ms' : '220ms' }}
        >
          {title}
        </h2>
        {quote && (
          <p
            className={cn(
              'mt-1.5 font-serif text-sm italic leading-relaxed text-ivory/90 transition-all duration-500 ease-out',
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: revealed ? '0ms' : '290ms' }}
          >
            <span className="mr-1 align-top font-serif text-base text-gold-400" aria-hidden="true">
              &ldquo;
            </span>
            {renderBoldText(quote)}
          </p>
        )}
        {badge && (
          <p
            className={cn(
              'mt-2.5 font-serif-en text-sm leading-relaxed text-gold-400 transition-all duration-500 ease-out',
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: revealed ? '0ms' : '360ms' }}
          >
            {badge}
          </p>
        )}
        <div
          className={cn(
            'mt-4 transition-all duration-500 ease-out',
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: revealed ? '0ms' : '430ms' }}
        >
          <MagneticButton className="inline-block">
            <Link
              href={href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-2.5 font-serif-en text-sm font-medium text-maroon-900 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-gold-300"
            >
              {linkLabel}
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
