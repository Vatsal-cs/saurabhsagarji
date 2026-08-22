'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function Parallax({
  children,
  className = '',
  /** Positive = drifts slower than scroll (background feel), negative = faster/foreground pop. */
  speed = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      gsap.to(ref.current, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [speed, reducedMotion] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
