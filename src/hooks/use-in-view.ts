'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Plain-CSS scroll reveal trigger: flips to true once the element has been
 * scrolled into view. Deliberately built on nothing but a raw
 * IntersectionObserver — no animation library in the loop — so the caller's
 * own CSS transition is the only thing responsible for how it looks.
 *
 * The failsafe is a last resort only (browsers that throttle/suspend
 * IntersectionObserver in backgrounded tabs) — it's deliberately long so it
 * never preempts a real scroll-triggered reveal for content that starts
 * below the fold; a short failsafe (a couple of seconds) fires before most
 * people even start scrolling, making the reveal look like it never waited
 * for scroll at all.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);

    const failsafe = setTimeout(() => setInView(true), 8000);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [threshold]);

  return { ref, inView };
}
