'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { TiltCard } from '@/components/motion/tilt-card';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';
import type { getPublishedBooks } from '@/lib/books';

// Cards slide in from alternating sides as they scroll into view — even
// cards from the left, odd from the right — on both mobile and desktop
// (this is plain CSS driven by a real IntersectionObserver, not tied to any
// specific viewport size).
export function BookCard({
  book,
  readLabel,
  index,
}: {
  book: Awaited<ReturnType<typeof getPublishedBooks>>[number];
  readLabel: string;
  index: number;
}) {
  const { ref, inView: revealed } = useInView<HTMLAnchorElement>(0.15);
  const fromLeft = index % 2 === 0;

  return (
    <Link
      ref={ref}
      href={`/books/${book.slug}`}
      className={cn(
        'group block transition-all duration-700 ease-out',
        revealed ? 'translate-x-0 opacity-100' : cn(fromLeft ? '-translate-x-16' : 'translate-x-16', 'opacity-0')
      )}
      style={{ transitionDelay: revealed ? '0ms' : `${(index % 5) * 90}ms` }}
    >
      <TiltCard max={12} className="rounded-xl">
        <div className="relative overflow-hidden rounded-xl bg-sand shadow-md ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-xl">
          <div className="relative aspect-[3/4]">
            {book.cover_image_url ? (
              <Image
                src={book.cover_image_url}
                alt={book.title_hi}
                fill
                priority={index < 4}
                sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-maroon-800 via-maroon-900 to-ink px-4 text-center">
                <span className="text-3xl text-gold-400">📖</span>
                <span className="font-serif text-xs leading-snug text-gold-200/80 line-clamp-3">
                  {book.title_hi}
                </span>
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="mb-4 rounded-full bg-ivory/95 px-4 py-1.5 text-xs font-medium text-maroon-800 shadow-sm">
              {readLabel}
            </span>
          </div>

          <span className="pointer-events-none absolute left-2 top-2 text-xs text-gold-400/0 transition-colors duration-300 group-hover:text-gold-400/90">❁</span>
          <span className="pointer-events-none absolute right-2 top-2 text-xs text-gold-400/0 transition-colors duration-300 group-hover:text-gold-400/90">❁</span>
        </div>
      </TiltCard>

      <div className="mt-3.5 px-0.5">
        <h2 className="line-clamp-2 font-serif text-base leading-snug tracking-tight text-neutral-900 transition-colors group-hover:text-maroon-800 sm:text-lg">
          {book.title_hi}
        </h2>
        {book.title_en && (
          <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 sm:text-sm">{book.title_en}</p>
        )}
        {book.publication_year && (
          <p className="mt-1.5 text-[10px] uppercase tracking-widest text-gold-600 sm:text-xs">
            {book.publication_year}
          </p>
        )}
      </div>
    </Link>
  );
}
