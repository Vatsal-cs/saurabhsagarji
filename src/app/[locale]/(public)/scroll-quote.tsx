'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function ScrollQuote({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;

      const split = SplitText.create(ref.current, { type: 'words' });
      gsap.set(split.words, { opacity: 0.15 });
      gsap.to(split.words, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          end: 'bottom 45%',
          scrub: true,
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [text, reducedMotion] }
  );

  return (
    <blockquote ref={ref} className={className}>
      {text}
    </blockquote>
  );
}
