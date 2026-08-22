'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { WarmTexture } from '@/components/ui/warm-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';
import type { ChannelVideo } from '@/lib/youtube';
import type { PublicBhajan } from '@/lib/bhajans';
import type { Language } from '@/lib/site-content';

// Cards settle into place first, then their thumbnail wipes into view like a
// curtain opening — the same "develops" reveal used for the About card. Each
// card watches the viewport independently via a plain IntersectionObserver
// (see useInView) and only staggers via its own CSS transition-delay — no
// animation library in the loop for the entrance itself.

type MediaItem = {
  kind: 'video' | 'bhajan';
  id: string;
  href: string;
  thumbnailUrl: string;
  title: string | null;
};

export function HomeMediaPreview({
  youtubeVideos,
  bhajans,
  lang,
}: {
  youtubeVideos: ChannelVideo[];
  bhajans: PublicBhajan[];
  lang: Language;
}) {
  const items: MediaItem[] = [
    ...youtubeVideos.slice(0, 2).map((v) => ({
      kind: 'video' as const,
      id: v.id,
      href: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnailUrl: v.thumbnailUrl,
      title: v.title,
    })),
    ...bhajans.slice(0, 2).map((b) => ({
      kind: 'bhajan' as const,
      id: b.id,
      href: `https://www.youtube.com/watch?v=${b.youtube_video_id}`,
      // No title is stored for bhajans (only the video id) — a still thumbnail from
      // YouTube's public CDN, no API call needed.
      thumbnailUrl: `https://img.youtube.com/vi/${b.youtube_video_id}/mqdefault.jpg`,
      title: null,
    })),
  ].slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-sand/50 px-6 py-24">
      <WarmTexture />
      <div className="relative mx-auto max-w-6xl">
        <SplitHeadline
          as="h2"
          onScroll
          text={lang === 'en' ? 'Discourses & Bhajans' : 'उपदेश एवं भजन'}
          className="text-balance font-serif text-4xl leading-tight text-maroon-800 sm:text-5xl"
        />

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {items.map((item, i) => (
            <MediaThumb key={item.id} item={item} lang={lang} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bouncing bars, like a "now playing" audio meter — used in place of a literal
 * broadcast cue, since this is devotional audio/video, not a live TV feed. */
function EqualizerBars() {
  const bars = [
    { duration: '0.8s', delay: '0s' },
    { duration: '1.1s', delay: '-0.3s' },
    { duration: '0.7s', delay: '-0.15s' },
  ];
  return (
    <div className="flex h-2.5 items-end gap-[2px]" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="animate-eq-bar w-[2.5px] rounded-full bg-maroon-700"
          style={{ height: '100%', animationDuration: b.duration, animationDelay: b.delay }}
        />
      ))}
    </div>
  );
}

/** Bulbs distributed evenly around a rectangle's perimeter, each running the same
 * flash cycle offset by its position — together they read as light chasing around
 * the frame, like the bulb strip on an old cinema marquee or a festival stage. */
function MarqueeLights({ count }: { count: number }) {
  const bulbs = Array.from({ length: count }, (_, i) => {
    const t = i / count;
    let x: number, y: number;
    if (t < 0.25) {
      x = (t / 0.25) * 100;
      y = 0;
    } else if (t < 0.5) {
      x = 100;
      y = ((t - 0.25) / 0.25) * 100;
    } else if (t < 0.75) {
      x = 100 - ((t - 0.5) / 0.25) * 100;
      y = 100;
    } else {
      x = 0;
      y = 100 - ((t - 0.75) / 0.25) * 100;
    }
    return { x, y, delay: i * (4.2 / count) };
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {bulbs.map((b, i) => (
        <span
          key={i}
          className="animate-marquee-bulb absolute h-2.5 w-2.5 rounded-full bg-gold-600 shadow-[0_0_12px_4px_rgba(190,140,40,0.65)]"
          style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${b.delay}s` }}
        />
      ))}
    </div>
  );
}

// Each card arrives from a different direction — left, below, right — so the
// row reads as pieces assembling into place rather than one uniform fade.
const ENTER_FROM = ['-translate-x-16', 'translate-y-12', 'translate-x-16'];

function MediaThumb({ item, lang, index }: { item: MediaItem; lang: Language; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const delayMs = index * 150;

  const { ref: cardRef, inView: revealed } = useInView<HTMLAnchorElement>(0.25);

  return (
    <a
      ref={cardRef}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block overflow-hidden bg-gradient-to-b from-saffron-50 via-sand to-saffron-100 p-4 shadow-[0_22px_45px_-18px_rgba(88,10,45,0.3)] transition-all ease-out hover:-translate-y-1',
        revealed ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : cn(ENTER_FROM[index % 3], 'scale-90 opacity-0')
      )}
      style={{
        transitionDelay: revealed ? '0ms' : `${delayMs}ms`,
        transitionDuration: revealed ? '300ms' : '800ms',
      }}
    >
      <MarqueeLights count={8} />

      <div className="relative">
        <div
          ref={ref}
          className="relative aspect-video overflow-hidden bg-neutral-900 transition-[clip-path] duration-700 ease-out"
          style={{
            transitionDelay: `${delayMs + 150}ms`,
            clipPath: revealed ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)',
          }}
        >
          <motion.img
            style={{ scale }}
            src={item.thumbnailUrl}
            alt={item.title ?? ''}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="absolute h-14 w-14 animate-ping rounded-full border-2 border-gold-500/70 [animation-duration:1.8s]" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-0.5 text-maroon-900">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="relative px-3 pt-4 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <EqualizerBars />
            <p className="truncate font-serif-en text-xs uppercase tracking-[0.15em] text-maroon-700">
              {item.kind === 'video' ? (lang === 'en' ? 'Discourse' : 'उपदेश') : lang === 'en' ? 'Bhajan' : 'भजन'}
            </p>
          </div>
          {item.title && (
            <p className="mt-2 line-clamp-1 font-serif text-base text-maroon-900">{item.title}</p>
          )}
        </div>
      </div>
    </a>
  );
}
