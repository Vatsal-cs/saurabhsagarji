'use client';

import { useRouter } from 'next/navigation';

/**
 * Lets the reveal (curtain + audio) be previewed as many times as needed
 * without ever touching the launch flag — same client-side navigation
 * mechanism as the real Launch button (see launch-button.tsx), which is
 * what lets the audio autoplay with sound instead of being silently
 * blocked. Needs the preview cookie already set in this browser (visit
 * /api/preview?token=... first) or this will just show the Coming Soon
 * splash instead of the reveal, same as any other visitor.
 */
export function TestRevealButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/?justLaunched=1')}
      className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100"
    >
      🔊 Test reveal animation (with sound)
    </button>
  );
}
