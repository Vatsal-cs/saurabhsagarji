import { cn } from '@/lib/cn';

/** Slowly drifting glow orbs for otherwise-plain light sections. */
export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {/* Kept off the horizontal center and pushed toward the edges so nothing glows directly behind centered content */}
      <div className="animate-orb-drift-a absolute top-[26rem] -left-20 h-96 w-96 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="animate-orb-drift-b absolute top-[8%] -right-20 h-80 w-80 rounded-full bg-maroon-700/10 blur-3xl [animation-delay:-6s]" />
      <div className="animate-orb-drift-a absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl [animation-delay:-11s]" />
      <div className="animate-orb-drift-b absolute bottom-1/4 -right-16 h-64 w-64 rounded-full bg-maroon-600/10 blur-3xl [animation-delay:-3s]" />
    </div>
  );
}
