'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const paddingY = useTransform(scrollY, [0, 140], [10, 6]);

  return (
    <motion.div
      style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      className="flex items-center justify-between gap-4 transition-[padding] duration-200"
    >
      {children}
    </motion.div>
  );
}
