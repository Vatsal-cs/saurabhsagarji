'use client';

import { useState, useTransition } from 'react';
import { toggleBhajanPublished, deleteBhajan } from '@/lib/actions/bhajans';
import type { Database } from '@/types/database';

type Bhajan = Database['public']['Tables']['bhajans']['Row'];

export function BhajanRow({ bhajan }: { bhajan: Bhajan }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [published, setPublished] = useState(bhajan.is_published);

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleBhajanPublished(bhajan.id);
      if (res.ok) setPublished((p) => !p);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteBhajan(bhajan.id);
      if (res.ok) setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-video bg-neutral-100">
        <iframe
          src={`https://www.youtube.com/embed/${bhajan.youtube_video_id}`}
          title="Bhajan preview"
          className="h-full w-full"
          allow="encrypted-media"
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <span
          className={
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
            (published ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600')
          }
        >
          {published ? 'Published' : 'Draft'}
        </span>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline disabled:opacity-50"
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
          {confirming ? (
            <span className="flex items-center gap-2">
              <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:underline">
                Yes
              </button>
              <button onClick={() => setConfirming(false)} className="text-neutral-500 hover:underline">
                No
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirming(true)} className="text-red-600 hover:underline">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
