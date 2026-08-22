'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from '@/i18n/navigation';

/**
 * Crossfades + gently zooms between routes — the outgoing page eases back
 * and fades while the incoming one settles in from a slight zoom, both at
 * once (no cover-then-reveal step, which read as a heavy "page drop").
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={pathname}
        className="h-full"
        initial={{ opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, scale: 0.975, pointerEvents: 'none', transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
