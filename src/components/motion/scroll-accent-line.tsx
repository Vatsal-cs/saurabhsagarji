'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/** A thin gold accent rule beside the children that fills top-to-bottom as the reader scrolls past. */
export function ScrollAccentLine({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.6'] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className={`relative pl-6 sm:pl-8 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-px bg-maroon-800/10" aria-hidden="true" />
      <motion.div
        style={{ scaleY, transformOrigin: 'top' }}
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-gold-500 via-gold-600 to-maroon-700"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
