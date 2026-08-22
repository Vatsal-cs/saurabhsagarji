import { cn } from '@/lib/cn';

/**
 * Faint animated grid + drifting glow orbs for dark hero sections.
 * Grid line color/opacity via inline style since Tailwind v4 arbitrary
 * background-image values get unwieldy for a two-layer gradient.
 */
export function GridBackground({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className="absolute inset-0 animate-grid-pulse"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in oklch, var(--color-gold-400) 14%, transparent) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, color-mix(in oklch, var(--color-gold-400) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 30%, black 10%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 30%, black 10%, transparent 78%)',
        }}
      />
      <div className="animate-orb-drift-a absolute -top-32 left-[15%] h-[26rem] w-[26rem] rounded-full bg-gold-400/10 blur-3xl" />
      <div className="animate-orb-drift-b absolute top-24 right-[10%] h-80 w-80 rounded-full bg-maroon-600/25 blur-3xl" />
      <div className="animate-orb-drift-a absolute bottom-0 left-[40%] h-72 w-72 rounded-full bg-gold-500/8 blur-3xl [animation-delay:-9s]" />
    </div>
  );
}
