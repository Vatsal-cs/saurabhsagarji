'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAboutSectionPublished } from '@/lib/actions/about';

export function SectionRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleAboutSectionPublished(id);
      if (!res.ok) setError(res.error);
      else router.refresh();
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
        href={`/prabhat-gate/about/${id}/edit`}
        className="text-sm text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
      >
        Edit
      </a>
    </div>
  );
}
