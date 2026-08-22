/**
 * Calls `callback` once the page's layout has had a chance to settle:
 * webfonts swapped in (the Devanagari serif renders noticeably taller than
 * its fallback) and every image/subresource loaded (`window`'s `load`
 * event), plus two animation frames for anything that mutates layout off
 * the back of those (e.g. GSAP SplitText's line rewrap in SplitHeadline).
 *
 * Scroll-reveal observers that start watching before this settles can catch
 * a section while it's still, briefly, within the viewport on the
 * unsettled/shorter layout — permanently locking it "revealed" via a
 * `once`-style observer even though the layout shift immediately pushes it
 * below the fold.
 *
 * Returns a cancel function to call from cleanup so a fast unmount doesn't
 * invoke the callback on a stale/unmounted target.
 */
export function onLayoutSettled(callback: () => void): () => void {
  let cancelled = false;

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  const windowLoaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));

  Promise.all([fontsReady, windowLoaded]).then(() => {
    if (cancelled) return;
    requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (!cancelled) callback();
      });
    });
  });

  return () => {
    cancelled = true;
  };
}
