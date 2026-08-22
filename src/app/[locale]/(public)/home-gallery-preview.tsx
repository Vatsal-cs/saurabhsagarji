import { Link } from '@/i18n/navigation';
import { WarmTexture } from '@/components/ui/warm-texture';
import { Reveal } from '@/components/ui/reveal';
import { SplitHeadline } from '@/components/motion/split-headline';
import { FallbackImage } from '@/components/ui/fallback-image';
import type { PublicPhoto } from '@/lib/gallery';
import type { Language } from '@/lib/site-content';

export function HomeGalleryPreview({ photos, lang }: { photos: PublicPhoto[]; lang: Language }) {
  if (photos.length === 0) return null;

  const mid = Math.ceil(photos.length / 2);
  const row1 = photos.slice(0, mid);
  const row2 = photos.length > 1 ? photos.slice(mid) : photos;

  return (
    <section className="relative overflow-hidden py-24">
      <WarmTexture />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-sm uppercase tracking-[0.2em] text-gold-600">
                {lang === 'en' ? 'Gallery' : 'चित्र दीर्घा'}
              </span>
            </div>
            <SplitHeadline
              as="h2"
              onScroll
              text={lang === 'en' ? 'Moments Captured' : 'यादगार पल'}
              className="mt-4 font-serif text-4xl leading-tight text-maroon-800 sm:text-5xl"
            />
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-6 py-2.5 font-serif-en text-sm font-medium text-maroon-800 transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10"
          >
            {lang === 'en' ? 'View gallery' : 'चित्र दीर्घा देखें'} →
          </Link>
        </div>
      </div>

      {/* The two fade overlays are absolutely positioned and stretch via
          inset-y-0, so they must NOT be direct siblings of the row spacing
          — `space-y-*` applies its gap to every child but the last one,
          which silently ate 16px off one overlay's height (it fell short of
          the bottom row's edge) while leaving the other untouched. Keeping
          the rows in their own spaced wrapper, with the overlays as plain
          siblings of that wrapper, keeps both overlays reading the full
          combined height. */}
      <Reveal className="relative mt-14">
        <div className="space-y-4">
          <GalleryRow photos={row1} reverse={false} />
          {row2.length > 0 && <GalleryRow photos={row2} reverse />}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ivory to-transparent sm:w-32"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ivory to-transparent sm:w-32"
          aria-hidden="true"
        />
      </Reveal>
    </section>
  );
}

function GalleryRow({ photos, reverse }: { photos: PublicPhoto[]; reverse: boolean }) {
  return (
    <div className="group overflow-hidden">
      <div
        className="flex w-max animate-marquee gap-4 motion-reduce:animate-none group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${photos.length * 6}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {[0, 1].map((rep) => (
          <div key={rep} className="flex shrink-0 gap-4">
            {photos.map((photo) => (
              <Link
                key={`${rep}-${photo.id}`}
                href="/gallery"
                className="group/item relative block h-32 w-44 shrink-0 overflow-hidden rounded-xl bg-sand shadow-[0_10px_25px_-15px_rgba(88,10,45,0.4)] sm:h-40 sm:w-56"
              >
                <FallbackImage
                  src={photo.image_url}
                  alt={photo.alt_text ?? ''}
                  sizes="(min-width: 640px) 224px, 176px"
                  className="object-contain transition-transform duration-500 group-hover/item:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover/item:bg-black/15" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
