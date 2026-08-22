import { cn } from '@/lib/cn';

/**
 * Fine paper-grain noise (feTurbulence, no repeating lines) for light
 * (ivory/sand) sections — the light counterpart to GridBackground.
 * Deliberately not a grid: that pattern is reserved for the homepage hero.
 */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function WarmTexture({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage: NOISE_BG,
          backgroundSize: '180px 180px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black 0%, transparent 80%)',
        }}
      />
    </div>
  );
}
