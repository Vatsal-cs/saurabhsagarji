'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { launchSite } from '@/lib/actions/launch';

export function LaunchButton({ launched }: { launched: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLaunched, setIsLaunched] = useState(launched);
  const [error, setError] = useState<string | null>(null);

  if (isLaunched) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
        <span aria-hidden="true">✓</span>
        Site is live
      </div>
    );
  }

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await launchSite();
      if (result.ok) {
        setIsLaunched(true);
        // The router (not a hard navigation) — staying in the same document
        // keeps this click's user-activation alive, which is what lets the
        // curtain reveal's audio autoplay with sound instead of getting
        // silently blocked. launchSite() already revalidated '/', so this
        // still lands on the fresh, just-launched homepage, not a stale one.
        router.push('/?justLaunched=1');
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg bg-crimson-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Launching…' : 'Launch Site'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
