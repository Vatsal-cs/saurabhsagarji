'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HIDDEN_CLIP = {
  up: 'inset(0 0 100% 0)',
  down: 'inset(100% 0 0 0)',
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
} as const;

/**
 * whileInView depends on IntersectionObserver, which some browsers throttle
 * or suspend for backgrounded/hidden tabs — if that happens the trigger may
 * never fire, permanently clipping the content. A timed failsafe forces the
 * visible state so content can never get stuck invisible.
 */
export function ClipReveal({
  children,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  direction?: keyof typeof HIDDEN_CLIP;
}) {
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForced(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className={className}
      initial={{ clipPath: HIDDEN_CLIP[direction] }}
      whileInView={{ clipPath: 'inset(0 0 0 0)' }}
      animate={forced ? { clipPath: 'inset(0 0 0 0)' } : undefined}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
