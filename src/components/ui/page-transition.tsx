/**
 * Previously crossfaded between routes via Framer Motion's AnimatePresence,
 * keyed on pathname. That relied on the key changing in perfect lockstep
 * with Next.js's own async page-content updates, which isn't guaranteed —
 * navigate quickly enough (e.g. away and back) and the two could fall out
 * of sync, leaving two page instances mounted at once. One of them was
 * often stuck with the exit animation's pointerEvents: 'none', since a
 * reused DOM node reversing back toward `animate` doesn't clear that unless
 * `animate` explicitly says so. Net effect: duplicated page content and
 * buttons that stopped responding after navigating away and back — a real,
 * reproducible bug, not a performance tuning issue. Rendering children
 * directly removes the entire mechanism that caused it.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return children;
}
