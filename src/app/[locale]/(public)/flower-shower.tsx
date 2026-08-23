const COLORS = ['#dc2626', '#f97316', '#ffffff', '#facc15', '#22c55e', '#3b82f6'];
const FLOWER_COUNT = 36;

// 37 is coprime with 100, so `(i * 37) % 100` spreads left positions evenly
// across the width without clustering, no Math.random() needed (this
// mounts client-only after a timeout anyway, but a fixed deterministic
// layout is just as easy and reads more "designed").
const FLOWERS = Array.from({ length: FLOWER_COUNT }, (_, i) => ({
  left: (i * 37) % 100,
  color: COLORS[i % COLORS.length],
  size: 14 + ((i * 7) % 10),
  delay: (i % 12) * 0.25,
  duration: 4.5 + ((i * 3) % 6) * 0.4,
}));

/** A single 5-petal flower, flat-colored petals with a gold center — kept
 * simple since these render at ~14-24px during a few-second shower. */
function Flower({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <g fill={color} stroke={color === '#ffffff' ? '#e5c78a' : 'none'} strokeWidth="0.5">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="12" cy="6" rx="3.2" ry="5" transform={`rotate(${deg} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="2.4" fill="#fbbf24" />
    </svg>
  );
}

/**
 * Launch-moment flower shower (pushpa vrishti) — sits between the curtain
 * panels (z-[200], opaque) and the revealed homepage underneath, so flowers
 * only become visible in the gap as the curtains part, then keep falling
 * onto the fully-revealed page for a few seconds after. Pure CSS animation
 * (transform + opacity only) — 36 elements is cheap since none of it runs
 * per-frame JS.
 */
export function FlowerShower() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[150] overflow-hidden" aria-hidden="true">
      {FLOWERS.map((f, i) => (
        <div
          key={i}
          className="animate-flower-fall absolute top-0"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        >
          <Flower color={f.color} />
        </div>
      ))}
    </div>
  );
}
