'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const rawPaddingY = useTransform(scrollY, [0, 140], [10, 6]);

  // The mobile nav's dropdown panel is portalled to <body> and positioned
  // with a fixed top-16 offset, which assumes the header's resting (10px
  // padding) height. Letting the header shrink to 6px padding while
  // scrolled left an 8px gap between the header and the panel once opened
  // mid-scroll, with page content peeking through — so the shrink effect is
  // desktop-only, where there's no such fixed-offset panel to misalign.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  const paddingY = useTransform(rawPaddingY, (v) => (isDesktop ? v : 10));

  return (
    <motion.div
      style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      className="flex items-center justify-between gap-4 transition-[padding] duration-200"
    >
      {children}
    </motion.div>
  );
}
