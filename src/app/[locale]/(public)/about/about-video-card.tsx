'use client';

import { useState } from 'react';

/** A YouTube card that plays a muted inline preview on hover (pointer devices
 * only — touch just shows the static thumbnail, since there's no hover to
 * trigger it there), with a persistent link to actually watch on YouTube. */
export function AboutVideoCard({ videoId, label }: { videoId: string; label: string }) {
  const [previewing, setPreviewing] = useState(false);

  function handleEnter() {
    if (window.matchMedia('(pointer: fine)').matches) setPreviewing(true);
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPreviewing(false)}
      className="group relative aspect-video overflow-hidden rounded-2xl border border-gold-500/25 bg-neutral-900 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] transition-all hover:border-gold-500 hover:shadow-[0_16px_40px_-12px_rgba(88,10,45,0.35)]"
    >
      {previewing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
          title={label}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      {!previewing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90 transition-opacity group-hover:opacity-0">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/95 shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-0.5 text-maroon-900">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      )}

      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3.5 py-1.5 font-serif-en text-xs font-medium text-maroon-900 shadow-md transition-transform hover:scale-105"
      >
        Watch on YouTube →
      </a>
    </div>
  );
}
