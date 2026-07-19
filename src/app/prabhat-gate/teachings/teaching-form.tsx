'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionResult } from '@/lib/actions/teachings';

export function TeachingForm({
  action,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      {state && !state.ok && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      )}
      {state && state.ok && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Added.
        </div>
      )}

      <label htmlFor="youtube_url" className="block text-sm font-medium text-neutral-700">
        YouTube link
      </label>
      <input
        id="youtube_url"
        name="youtube_url"
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        className="mt-1.5 block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />

      <label htmlFor="pravachan_date" className="mt-4 block text-sm font-medium text-neutral-700">
        Date (optional)
      </label>
      <input
        id="pravachan_date"
        name="pravachan_date"
        type="date"
        className="mt-1.5 block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked
            className="h-4 w-4 rounded border-neutral-300 text-crimson-800 focus:ring-crimson-800"
          />
          Publish immediately
        </label>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-crimson-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crimson-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Adding\u2026' : 'Add'}
    </button>
  );
}
