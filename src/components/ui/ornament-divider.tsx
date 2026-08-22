'use client';

import { useEffect, useRef, useState } from 'react';

export function OrnamentDivider({
  className = '',
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stroke = light ? 'var(--color-gold-400)' : 'var(--color-gold-500)';
  const glyphClass = light ? 'text-gold-400' : 'text-gold-500';

  return (
    <div ref={ref} className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <svg width="64" height="2" viewBox="0 0 64 2" className="overflow-visible">
        <line
          x1="0" y1="1" x2="64" y2="1"
          stroke={stroke}
          strokeWidth="1"
          strokeDasharray="64"
          strokeDashoffset={visible ? 0 : 64}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <span
        className={`${glyphClass} text-lg leading-none transition-opacity duration-700`}
        style={{ opacity: visible ? 1 : 0, transitionDelay: '450ms' }}
      >
        ❁
      </span>
      <svg width="64" height="2" viewBox="0 0 64 2" className="overflow-visible">
        <line
          x1="64" y1="1" x2="0" y2="1"
          stroke={stroke}
          strokeWidth="1"
          strokeDasharray="64"
          strokeDashoffset={visible ? 0 : 64}
          style={{ transition: 'stroke-dashoffset 900ms ease-out', transitionDelay: '150ms' }}
        />
      </svg>
    </div>
  );
}
