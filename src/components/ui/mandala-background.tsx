import { cn } from '@/lib/cn';

/**
 * Faint mandala/floral linework for the hero section — the image-based
 * counterpart to the old CSS-drawn grid.
 *
 * The source graphic is a true seamless repeat unit (one flower medallion
 * centered in each tile), so it's rendered as a repeating background rather
 * than stretched/cropped. That keeps the pattern's visual density identical
 * on every screen size and, since `background-position: center` places the
 * image's own center at the container's center, always lands one flower
 * medallion in the middle — behind Guruji's head in the hero layout.
 *
 * Kept low opacity so the pattern reads as texture rather than competing
 * with Guruji's photo or any text.
 */
export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 bg-maroon-900 bg-center opacity-25 [background-size:280px_280px] max-sm:opacity-20 max-sm:[background-size:220px_220px]',
        className
      )}
      style={{
        backgroundImage: 'url(/mandala-pattern.webp)',
        backgroundRepeat: 'repeat',
      }}
      aria-hidden="true"
    />
  );
}
