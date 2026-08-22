'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const flyInVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotate: -6, scale: 0.94 },
  show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function StaggerGroup({
  children,
  className = '',
  stagger = 0.09,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  // Failsafe: whileInView depends on IntersectionObserver, which some
  // browsers throttle or suspend for backgrounded/hidden tabs. Force the
  // "show" state after a timeout so items can never get stuck invisible.
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForced(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      animate={forced ? 'show' : undefined}
      viewport={{ once: true, amount: 0.1 }}
      custom={stagger}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  variants = itemVariants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
