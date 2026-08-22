'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleEventPublished, deleteEvent } from '@/lib/actions/events';

export function EventRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleEventPublished(id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res && !res.ok) {
        setError(res.error);
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-sm text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline disabled:opacity-50"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
        <a
        href={`/prabhat-gate/events/${id}/edit`}
        className="text-sm text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
      >
        Edit
      </a>
      {confirming ? (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Sure?</span>
          <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:underline disabled:opacity-50">
            Yes
          </button>
          <button onClick={() => setConfirming(false)} disabled={isPending} className="text-neutral-500 hover:underline">
            No
          </button>
        </span>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-sm text-red-600 underline-offset-2 hover:underline">
          Delete
        </button>
      )}
    </div>
  );
}
