'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function SplitHeadline({
  text,
  as: Tag = 'h1',
  className = '',
  delay = 0,
  onScroll = false,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  delay?: number;
  /** Trigger when scrolled into view instead of immediately on mount. */
  onScroll?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;

      let split: SplitText | undefined;
      let cancelled = false;

      // SplitText's line-detection measures actual layout — if it runs before the
      // custom webfont swaps in, it locks in line breaks based on the fallback
      // font's (different) metrics, permanently mis-wrapping the headline.
      const run = () => {
        if (cancelled || !ref.current) return;
        split = SplitText.create(ref.current, {
          type: 'lines,words',
          linesClass: 'overflow-hidden',
        });

        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          stagger: 0.035,
          ease: 'power4.out',
          delay: delay / 1000,
          ...(onScroll
            ? { scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
            : {}),
        });
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(run);
      } else {
        run();
      }

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref, dependencies: [text, reducedMotion, onScroll] }
  );

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
