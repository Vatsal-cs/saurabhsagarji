'use client';

import { useCallback, useRef, useState } from 'react';
import { extractYouTubeId } from '@/lib/youtube';

type PreviewData = { title: string; image: string | null; description: string | null; hostname: string };

/** One shared cache + in-flight map across every InlineLink on the page, so
 * hovering the same link (or the same link appearing twice) only ever fetches
 * its preview once. */
const previewCache = new Map<string, Promise<PreviewData | null>>();

function fetchPreview(absoluteUrl: string): Promise<PreviewData | null> {
  let entry = previewCache.get(absoluteUrl);
  if (!entry) {
    entry = fetch(`/api/link-preview?url=${encodeURIComponent(absoluteUrl)}`)
      .then((res) => (res.ok ? (res.json() as Promise<PreviewData>) : null))
      .catch(() => null);
    previewCache.set(absoluteUrl, entry);
  }
  return entry;
}

/** Renders an admin-authored inline link with a small hover preview —
 * an inline video for YouTube links, or a fetched title/image card for
 * anything else. Touch devices just get a plain link (no hover to trigger
 * it), matching the pointer-fine gating used elsewhere on the site. */
function safeHostname(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
}

export function InlineLink({ href, label }: { href: string; label: string }) {
  const external = /^https?:\/\//.test(href);
  const videoId = extractYouTubeId(href);
  const fallbackSource = videoId ? 'YouTube' : external ? safeHostname(href) : 'This page';
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
    timerRef.current = setTimeout(() => {
      setOpen(true);
      if (!videoId && preview === undefined) {
        const absolute = external ? href : new URL(href, window.location.origin).toString();
        fetchPreview(absolute).then(setPreview);
      }
    }, 200);
  }, [href, external, videoId, preview]);

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  return (
    <span className="relative inline-block" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="text-maroon-700 underline decoration-maroon-400/60 underline-offset-2 transition-colors hover:text-maroon-900"
      >
        {label}
      </a>

      {open && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-72 -translate-x-1/2 not-italic">
          <span className="block overflow-hidden rounded-xl border border-gold-500/30 bg-white text-left shadow-[0_20px_45px_-14px_rgba(88,10,45,0.4)]">
            {videoId ? (
              <span className="relative block aspect-video w-full bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/95">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-0.5 text-maroon-900">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </span>
            ) : preview?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.image} alt="" className="h-32 w-full object-cover" />
            ) : null}

            <span className="block px-3.5 py-2.5">
              <span className="block truncate font-serif-en text-[10px] font-medium uppercase tracking-wide text-gold-600">
                {preview?.hostname ?? fallbackSource}
              </span>
              <span className="mt-1 block line-clamp-2 font-serif-en text-xs font-semibold leading-snug text-maroon-900">
                {preview === undefined && !videoId ? 'Loading preview…' : (preview?.title ?? label)}
              </span>
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
