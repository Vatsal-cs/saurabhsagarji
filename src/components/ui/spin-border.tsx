import { cn } from '@/lib/cn';

const DEFAULT_GRADIENT =
  'conic-gradient(from 0deg, var(--color-gold-500), transparent 25%, var(--color-gold-400) 50%, transparent 75%, var(--color-gold-500))';

/**
 * A slowly rotating gold border ring. Spins a static, oversized
 * conic-gradient layer via transform (compositor-only, no repaint) instead
 * of animating the CSS custom property that used to drive the gradient's
 * own angle — regenerating the gradient every frame, forever, on cards
 * that are prominent and always visible, was real jank on weak GPUs.
 *
 * The rotating layer is sized well past the wrapper (250% of its width,
 * forced square via aspect-square so it stays a true circle regardless of
 * the wrapper's own aspect ratio) and clipped by the wrapper's own
 * `overflow-hidden` + whatever radius/shape className is passed in, so it
 * never reveals a corner at any rotation angle.
 */
export function SpinBorder({
  children,
  className = '',
  gradient = DEFAULT_GRADIENT,
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="animate-spin-border-rotate absolute top-1/2 left-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundImage: gradient }}
        aria-hidden="true"
      />
      <div className="relative m-[2px]">{children}</div>
    </div>
  );
}
