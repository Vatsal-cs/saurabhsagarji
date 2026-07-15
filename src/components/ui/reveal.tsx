'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades/slides children into view on scroll.
 * Fail-safe: if IntersectionObserver is unavailable, reduced-motion is on,
 * or anything goes wrong, content is shown immediately.
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
  // Start visible so SSR/no-JS/observer-failure never hides content.
  const [visible, setVisible] = useState(true);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // Only enable the animation if everything we need is available.
    if (typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const el = ref.current;
    if (!el) return;

    // If it's already on screen at mount, leave it visible (no flash).
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyInView) {
      setArmed(true);
      return;
    }

    // Otherwise hide it and animate in when scrolled to.
    setVisible(false);
    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);

    // Safety net: reveal after 1.5s no matter what.
    const failsafe = setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 1500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        armed
          ? {
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}