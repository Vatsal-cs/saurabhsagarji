'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { onLayoutSettled } from '@/lib/dom-ready';

/**
 * Fades/slides children into view on scroll. Built on a manual
 * IntersectionObserver (not Framer Motion's whileInView) so observation can
 * be deferred until the page's layout has settled (see onLayoutSettled) —
 * starting it any earlier can catch a section while it's still, briefly,
 * within the viewport on an unsettled/shorter layout, permanently locking
 * it "revealed" even though the layout shift right after immediately
 * pushes it below the fold.
 *
 * The animate prop (rather than a raw CSS transition) keeps this degrading
 * the same way under MotionConfig reducedMotion="user" — it strips the
 * translateY and keeps only the opacity fade.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
        { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
      );
      observer.observe(el);
    });

    return () => {
      cancelSettle();
      observer?.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 28 }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
