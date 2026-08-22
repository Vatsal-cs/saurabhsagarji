import { Parallax } from '@/components/motion/parallax';

const SWAYS = ['animate-drift-up-a', 'animate-drift-up-b', 'animate-drift-up-c'];

// Spread across the full height (top %) rather than anchored to the bottom,
// so particles read as ambient throughout a section regardless of how tall
// it is — each still does its own local rise-and-fade drift from here.
//
// Trimmed from 106 down to 30, and dropped the per-particle blur filter:
// this renders on the homepage hero, the very first thing visible on load,
// and 106 simultaneously CSS-animating elements (a third of them also
// running a continuous blur() — one of the most compositor-expensive CSS
// properties there is) was real, measurable jank on weaker phone GPUs.
const PARTICLES = [
  { left: '4%', top: '8%', size: 3, delay: 0, duration: 14, sway: 0 },
  { left: '11%', top: '22%', size: 2, delay: 5, duration: 19, sway: 1 },
  { left: '18%', top: '4%', size: 4, delay: 3, duration: 12, sway: 2 },
  { left: '25%', top: '35%', size: 2, delay: 9, duration: 17, sway: 0 },
  { left: '32%', top: '15%', size: 3, delay: 1, duration: 15, sway: 1 },
  { left: '38%', top: '48%', size: 2, delay: 7, duration: 20, sway: 2 },
  { left: '45%', top: '28%', size: 3, delay: 4, duration: 13, sway: 0 },
  { left: '52%', top: '60%', size: 2, delay: 11, duration: 18, sway: 1 },
  { left: '59%', top: '10%', size: 4, delay: 2, duration: 14, sway: 2 },
  { left: '65%', top: '42%', size: 2, delay: 8, duration: 16, sway: 0 },
  { left: '71%', top: '68%', size: 3, delay: 6, duration: 19, sway: 1 },
  { left: '77%', top: '18%', size: 2, delay: 12, duration: 13, sway: 2 },
  { left: '83%', top: '52%', size: 3, delay: 10, duration: 17, sway: 0 },
  { left: '89%', top: '30%', size: 2, delay: 4, duration: 21, sway: 1 },
  { left: '94%', top: '75%', size: 4, delay: 0, duration: 15, sway: 2 },
  { left: '8%', top: '80%', size: 2, delay: 13, duration: 16, sway: 0 },
  { left: '55%', top: '88%', size: 2, delay: 5, duration: 14, sway: 1 },
  { left: '68%', top: '92%', size: 3, delay: 9, duration: 18, sway: 2 },
  { left: '15%', top: '58%', size: 2, delay: 7, duration: 17, sway: 1 },
  { left: '42%', top: '78%', size: 3, delay: 2, duration: 15, sway: 0 },
  { left: '88%', top: '55%', size: 2, delay: 6, duration: 19, sway: 2 },
  { left: '30%', top: '95%', size: 3, delay: 10, duration: 13, sway: 1 },
  { left: '62%', top: '4%', size: 3, delay: 3, duration: 13, sway: 2 },
  { left: '72%', top: '53%', size: 4, delay: 5, duration: 12, sway: 0 },
  { left: '50%', top: '4%', size: 2, delay: 9, duration: 18, sway: 0 },
  { left: '44%', top: '28%', size: 2, delay: 10, duration: 13, sway: 1 },
  { left: '28%', top: '22%', size: 3, delay: 1, duration: 15, sway: 1 },
  { left: '59%', top: '78%', size: 3, delay: 7, duration: 21, sway: 0 },
  { left: '54%', top: '80%', size: 4, delay: 12, duration: 15, sway: 2 },
  { left: '8%', top: '64%', size: 3, delay: 13, duration: 20, sway: 1 },
];

export function GoldParticles({ className = '' }: { className?: string }) {
  return (
    <Parallax speed={-0.12} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div aria-hidden="true" className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`${SWAYS[p.sway]} absolute rounded-full bg-gold-600/65`}
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
    </Parallax>
  );
}
