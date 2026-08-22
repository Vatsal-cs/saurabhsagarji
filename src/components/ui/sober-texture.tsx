import { cn } from '@/lib/cn';

/**
 * Fine diamond jaali lattice — echoes temple marble grille screens — for
 * standalone content pages. GridBackground's literal square grid is
 * reserved for the homepage hero, so this crosses two soft 45° hairline
 * sets instead, repeating uniformly down the whole page rather than
 * fading out after the first screen.
 *
 * The background-image is a single plain string literal, not built from
 * concatenated template literals — that pattern previously got silently
 * mangled by the production minifier (a chunk of the string between the
 * two gradients was dropped), so the lattice rendered fine in dev but
 * came out as `background-image: none` on the deployed build.
 */
const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const LATTICE_BG =
  'repeating-linear-gradient(45deg, transparent 0px, transparent 42px, color-mix(in oklch, var(--color-gold-600) 16%, transparent) 43px, transparent 44px), repeating-linear-gradient(-45deg, transparent 0px, transparent 42px, color-mix(in oklch, var(--color-gold-600) 16%, transparent) 43px, transparent 44px)';

export function SoberTexture({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: LATTICE_BG }}
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
