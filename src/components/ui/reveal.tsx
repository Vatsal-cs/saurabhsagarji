'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Fades/slides children into view on scroll. Built on Framer Motion's
 * whileInView, which auto-degrades under MotionConfig reducedMotion="user"
 * (drops the translateY, keeps the opacity fade).
 *
 * whileInView depends on IntersectionObserver, which some browsers throttle
 * or suspend entirely for backgrounded/hidden tabs — if that happens the
 * trigger may never fire. A timed failsafe forces the visible state so
 * content can never get stuck invisible.
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
  const [forced, setForced] = useState(false);

  useEffect(() => {
    // 2000ms fired even on sections well below the fold — before anyone
    // could plausibly have scrolled to them, so it wasn't acting as a
    // last-resort safety net, it was the primary (broken) reveal path on
    // every load. Matches the same 8000ms value already used for the same
    // failsafe purpose in useInView.
    const t = setTimeout(() => setForced(true), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={forced ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
