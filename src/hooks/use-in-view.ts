'use client';

import { useEffect, useRef, useState } from 'react';
import { onLayoutSettled } from '@/lib/dom-ready';

/**
 * Plain-CSS scroll reveal trigger: flips to true once the element has been
 * scrolled into view. Deliberately built on nothing but a raw
 * IntersectionObserver — no animation library in the loop — so the caller's
 * own CSS transition is the only thing responsible for how it looks.
 *
 * No timed failsafe: a fixed timeout fires for every instance mounted around
 * the same time regardless of scroll position, so content below the fold
 * pops in on its own a few seconds after load — exactly the "reveals itself
 * without scrolling" bug it was meant to prevent. If a tab is backgrounded
 * and the observer is throttled, nobody's watching anyway; it reveals
 * correctly once the tab is visible again.
 *
 * Observation is deferred until the page's layout has settled (see
 * onLayoutSettled) — starting it any earlier can catch a section while it's
 * still, briefly, within the viewport on an unsettled/shorter layout,
 * permanently locking it "revealed" even though the layout shift right
 * after immediately pushes it below the fold.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let observer: IntersectionObserver | undefined;

    const cancelSettle = onLayoutSettled(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer?.disconnect();
          }
        },
        { threshold, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(el);
    });

    return () => {
      cancelSettle();
      observer?.disconnect();
    };
  }, [threshold]);

  return { ref, inView };
}
