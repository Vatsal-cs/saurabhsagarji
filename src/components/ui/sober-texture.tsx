import { cn } from '@/lib/cn';

/**
 * Fine diamond jaali lattice — echoes temple marble grille screens — for
 * standalone content pages. GridBackground's literal square grid is
 * reserved for the homepage hero, so this crosses two 45° hairline sets
 * with a small gold dot at each cell's center instead, repeating uniformly
 * down the whole page rather than fading out after the first screen.
 */
const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CELL = 44;

export function SoberTexture({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `repeating-linear-gradient(45deg, color-mix(in oklch, var(--color-gold-600) 13%, transparent) 0 1px, transparent 1px ${CELL}px), ` +
            `repeating-linear-gradient(-45deg, color-mix(in oklch, var(--color-gold-600) 13%, transparent) 0 1px, transparent 1px ${CELL}px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, color-mix(in oklch, var(--color-gold-500) 45%, transparent) 0 1.4px, transparent 1.6px)',
          backgroundSize: `${CELL}px ${CELL}px`,
          backgroundPosition: `${CELL / 2}px ${CELL / 2}px`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: GRAIN_BG,
          backgroundSize: '180px 180px',
        }}
      />
    </div>
  );
}
