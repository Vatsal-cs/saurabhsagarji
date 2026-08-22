'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Wraps next/image with a fallback for photos Next's optimizer can't process
 * (older gallery uploads at full camera resolution — 20-30+ megapixels — can
 * exceed what the on-the-fly optimizer will handle and 500 instead of
 * resizing). On error, drops to `unoptimized` so the browser just loads the
 * original directly rather than showing a broken image. New uploads are
 * resized server-side before they ever reach storage, so this is a safety
 * net for pre-existing files, not the primary fix.
 *
 * Defaults to eager loading — this is meant for images inside continuously
 * CSS-animated containers (marquees, drag decks), where native
 * `loading="lazy"` intersection detection reliably never fires because the
 * element's *visual* position (post-transform) never matches its static
 * *layout* position that the browser measures against.
 */
export function FallbackImage({
  src,
  alt,
  sizes,
  className,
  eager = true,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={failed}
      sizes={sizes}
      className={`select-none [-webkit-touch-callout:none] ${className ?? ''}`}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onError={() => setFailed(true)}
    />
  );
}
