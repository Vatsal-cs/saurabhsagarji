export function Marquee({
  items,
  className = '',
  duration = 28,
  /** true = drifts rightward, new content entering from the left edge; false (default) = drifts left. */
  reverse = false,
}: {
  items: string[];
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const content = items.join('   ');

  return (
    <div className={className}>
      <p className="sr-only">{content}</p>
      <div className="group overflow-hidden" aria-hidden="true">
        <div
          className="flex w-max animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {[0, 1].map((rep) => (
            <span key={rep} className="shrink-0 whitespace-nowrap">
              {content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
