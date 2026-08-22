import { cn } from '@/lib/cn';

/** Minimal sole-and-toes mark — used to trace a footstep pair along the flowing lines. */
function Footprint({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" fill="currentColor" className={className}>
      <ellipse cx="12" cy="20" rx="6" ry="9" />
      <circle cx="7" cy="6" r="2" />
      <circle cx="11.5" cy="4" r="2.2" />
      <circle cx="16" cy="5.5" r="1.9" />
      <circle cx="19.5" cy="9" r="1.5" />
    </svg>
  );
}

/** Slow-drifting dashed threads for otherwise-flat light sections — pairs with AmbientGlow. */
export function FlowingLines({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0', className)}>
      <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <path
          d="M -50 120 C 250 40, 450 220, 700 140 S 1150 60, 1300 160"
          stroke="var(--color-gold-500)"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="10 16"
          className="animate-flow-dash"
        />
        <path
          d="M -50 420 C 200 500, 500 320, 750 420 S 1100 540, 1300 440"
          stroke="var(--color-maroon-700)"
          strokeOpacity="0.14"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="8 20"
          className="animate-flow-dash"
          style={{ animationDuration: '20s', animationDirection: 'reverse' }}
        />
        <path
          d="M -50 650 C 300 600, 550 750, 850 660 S 1150 580, 1300 680"
          stroke="var(--color-gold-400)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6 14"
          className="animate-flow-dash"
          style={{ animationDuration: '24s' }}
        />
      </svg>

      {/* A little pair of footsteps crossing the middle line */}
      <Footprint className="absolute left-[58%] top-[49%] h-7 w-7 -rotate-[15deg] text-gold-600 opacity-25" />
      <Footprint className="absolute left-[63%] top-[54%] h-7 w-7 rotate-[15deg] scale-x-[-1] text-gold-600 opacity-25" />
    </div>
  );
}
