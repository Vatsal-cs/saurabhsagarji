'use client';

import { useState, useTransition } from 'react';
import { deleteBook } from '@/lib/actions/books';

export function BookRowActions({
  id,
  titleHi,
}: {
  id: string;
  titleHi: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteBook(id);
      if (res && !res.ok) {
        setError(res.error);
        setConfirming(false);
      }
      // On success, deleteBook redirects; router.refresh not needed
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-red-600">{error}</span>}

      <a
        href={`/prabhat-gate/books/${id}/edit`}
        className="text-sm text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
      >
        Edit
      </a>

      {confirming ? (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Delete &ldquo;{titleHi}&rdquo;?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:underline disabled:opacity-50"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="text-neutral-500 hover:underline"
          >
            No
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-sm text-red-600 underline-offset-2 hover:underline"
        >
          Delete
        </button>
      )}
    </div>
  );
}
