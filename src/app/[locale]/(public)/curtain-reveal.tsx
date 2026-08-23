'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FlowerShower } from './flower-shower';

/**
 * One-time launch moment: two curtain panels cover the homepage, hold for a
 * beat, then part to either side, timed with a short sound clip. Only ever
 * rendered when the URL carries ?justLaunched=1 (set by the admin's Launch
 * button, which navigates client-side rather than a hard reload specifically
 * so this component mounts within the same user-activation window as that
 * click — the thing that lets the audio autoplay with sound instead of
 * getting silently blocked) — the query param is stripped from the URL bar
 * immediately on mount, so a refresh or a bookmark of this URL never replays
 * it. All the fabric detail below is a static background-image, computed
 * once — only `transform` animates, so it stays compositor-only (cheap)
 * despite being full-viewport. The <audio> element outlives the curtain
 * visuals (kept mounted after they're gone) so the clip finishes playing
 * even though it runs longer than the parting animation itself.
 */

/** Vertical pleats (alternating shadow/highlight bands) plus a soft fold
 * darkening toward the seam edge — what actually reads as "fabric" instead
 * of a flat rectangle. */
function pleatTexture(side: 'left' | 'right') {
  const seamFade =
    side === 'left'
      ? 'linear-gradient(to right, transparent 0%, transparent 82%, rgba(0,0,0,0.45) 100%)'
      : 'linear-gradient(to left, transparent 0%, transparent 82%, rgba(0,0,0,0.45) 100%)';
  const pleats =
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 2px, transparent 2px, transparent 9px, rgba(255,255,255,0.07) 9px, rgba(255,255,255,0.07) 11px, transparent 11px, transparent 22px)';
  const sheen = 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.08), transparent 65%)';
  return `${seamFade}, ${sheen}, ${pleats}`;
}

const OPEN_DURATION_S = 7.5;

function CurtainPanel({ side, x }: { side: 'left' | 'right'; x: string }) {
  const edge = side === 'left' ? 'right' : 'left';
  return (
    <motion.div
      initial={{ x: '0%' }}
      animate={{ x }}
      transition={{ duration: OPEN_DURATION_S, ease: [0.45, 0, 0.55, 1] }}
      className="relative h-full w-1/2 bg-maroon-950"
      style={{ backgroundImage: pleatTexture(side) }}
    >
      {/* Rod / valance */}
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-gold-500 via-gold-500 to-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.55)]" />
      {/* Leading edge binding, where the two panels meet */}
      <div
        className={`absolute inset-y-0 ${edge}-0 w-[3px] bg-gradient-to-b from-gold-500/0 via-gold-400 to-gold-500/0`}
      />
      {/* Bottom fringe */}
      <div
        className="absolute inset-x-0 bottom-0 h-2.5 opacity-80"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--color-gold-500) 0px, var(--color-gold-500) 2px, transparent 2px, transparent 9px)',
        }}
      />
    </motion.div>
  );
}

export function CurtainReveal() {
  const [open, setOpen] = useState(false);
  const [curtainVisible, setCurtainVisible] = useState(true);
  const [flowersVisible, setFlowersVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('justLaunched');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);

    const openTimer = setTimeout(() => {
      setOpen(true);
      setFlowersVisible(true);
      // Autoplay-with-sound only works when browsers still consider this
      // "connected" to the click that led here — never treat a rejection as
      // a real error, since some browsers/devices will legitimately block
      // it and the curtain animation is the fallback either way.
      audioRef.current?.play().catch(() => {});
    }, 500);
    const hideCurtainTimer = setTimeout(() => setCurtainVisible(false), 500 + OPEN_DURATION_S * 1000 + 300);
    // Longer than the curtain — flowers keep falling onto the fully-revealed
    // page for a few seconds after the curtain itself is gone, covering the
    // slowest flower's own delay + fall duration with room to spare.
    const hideFlowersTimer = setTimeout(() => setFlowersVisible(false), 500 + 10000);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(hideCurtainTimer);
      clearTimeout(hideFlowersTimer);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/launch-sound.m4a" preload="auto" />
      {flowersVisible && <FlowerShower />}
      {curtainVisible && (
        <div className="pointer-events-none fixed inset-0 z-[200] flex" aria-hidden="true">
          <CurtainPanel side="left" x={open ? '-100%' : '0%'} />
          <CurtainPanel side="right" x={open ? '100%' : '0%'} />
        </div>
      )}
    </>
  );
}
