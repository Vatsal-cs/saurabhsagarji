'use client';

import { useState } from 'react';
import Image from 'next/image';

export function FallbackImage({
  src,
  alt,
  sizes,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
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