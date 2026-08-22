'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actions/events';
import type { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];

type Props = {
  event?: Event;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function EventForm({ event, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const isEdit = !!event;

  const [titleEn, setTitleEn] = useState(event?.title_en ?? '');
  const [slug, setSlug] = useState(event?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [showSlugField, setShowSlugField] = useState(false);

  useEffect(() => {
    if (slugTouched) return;
    const generated = slugify(titleEn);
    setSlug(generated || `event-${Date.now()}`);
  }, [titleEn, slugTouched]);

  return (
    <form action={formAction} className="space-y-10">
      {state && !state.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      )}
      {state && state.ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          Saved successfully.
        </div>
      )}

      <Section title="Cover image (optional)">
        <CoverDropzone currentUrl={event?.cover_image_url ?? null} />
      </Section>

      <Section title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="title_hi"
            label="Title (Hindi)"
            defaultValue={event?.title_hi}
            error={state && !state.ok ? state.fieldErrors?.title_hi : undefined}
            required
          />
          <div>
            <label htmlFor="title_en" className="block text-sm font-medium text-neutral-700">
              Title (English)
              <span className="text-red-500"> *</span>
            </label>
            <input
              id="title_en"
              name="title_en"
              required
              defaultValue={event?.title_en ?? ''}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Paryushan Mahaparv 2026"
              className="mt-1.5 block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
            {state && !state.ok && state.fieldErrors?.title_en && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title_en}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">Used to auto-generate the page URL below.</p>
          </div>
        </div>

        <input type="hidden" name="slug" value={slug} />
        {!showSlugField ? (
          <button
            type="button"
            onClick={() => setShowSlugField(true)}
            className="block text-left text-xs text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline"
          >
            Page address: /events/{slug || '\u2026'} \u00b7 click to edit manually
          </button>
        ) : (
          <div>
            <label htmlFor="slug_visible" className="block text-sm font-medium text-neutral-700">
              URL slug
            </label>
            <input
              id="slug_visible"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="mt-1.5 block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
            <p className="mt-1 text-xs text-neutral-500">Lowercase, hyphens only.</p>
            {state && !state.ok && state.fieldErrors?.slug && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.slug}</p>
            )}
          </div>
        )}

        <TextArea
          name="description_hi"
          label="Description (Hindi)"
          defaultValue={event?.description_hi ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_hi : undefined}
        />
        <TextArea
          name="description_en"
          label="Description (English)"
          defaultValue={event?.description_en ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_en : undefined}
        />
      </Section>

      <Section title="Date & time" subtitle="Leave end date empty for a single-day event.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="start_datetime"
            label="Start"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.start_datetime ?? null)}
            error={state && !state.ok ? state.fieldErrors?.start_datetime : undefined}
            required
          />
          <Field
            name="end_datetime"
            label="End (optional \u2014 for multi-day events)"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.end_datetime ?? null)}
            error={state && !state.ok ? state.fieldErrors?.end_datetime : undefined}
          />
        </div>
      </Section>

      <Section title="Venue">
        <Field
          name="venue_name"
          label="Venue name"
          defaultValue={event?.venue_name ?? ''}
          error={state && !state.ok ? state.fieldErrors?.venue_name : undefined}
        />
        <Field
          name="venue_address"
          label="Address"
          defaultValue={event?.venue_address ?? ''}
          error={state && !state.ok ? state.fieldErrors?.venue_address : undefined}
        />
        <Field
          name="venue_map_url"
          label="Map link (optional)"
          placeholder="https://maps.google.com/..."
          defaultValue={event?.venue_map_url ?? ''}
          error={state && !state.ok ? state.fieldErrors?.venue_map_url : undefined}
        />
      </Section>

      <Section title="Recording (optional)" subtitle="Add once the event has happened, if a video exists.">
        <Field
          name="youtube_url"
          label="YouTube link"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={event?.youtube_url ?? ''}
          error={state && !state.ok ? state.fieldErrors?.youtube_url : undefined}
        />
      </Section>

      <Section title="Visibility">
        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-500/50">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={event?.is_published ?? false}
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-crimson-800 focus:ring-crimson-800"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Publish this event</span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              When enabled, this event appears on the public \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e / Events page.
            </span>
          </span>
        </label>
      </Section>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link href="/prabhat-gate/events" className="text-sm text-neutral-600 transition-colors hover:text-crimson-800">
          \u2190 Back to all events
        </Link>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}

function CoverDropzone({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      applyFile(file);
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          'group relative flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ' +
          (dragging
            ? 'border-gold-500 bg-gold-400/10'
            : 'border-neutral-300 bg-neutral-50 hover:border-gold-500 hover:bg-gold-400/5')
        }
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-neutral-900">
                Change cover
              </span>
            </div>
          </>
        ) : (
          <div className="px-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/20 text-2xl text-gold-600">
              \u2b06
            </div>
            <p className="text-sm font-medium text-neutral-700">Drop cover here</p>
            <p className="mt-1 text-xs text-neutral-500">or click to browse \u00b7 max 10 MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        name="cover_image_file"
        type="file"
        accept="image/*"
        onChange={(e) => applyFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-crimson-800 px-7 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-crimson-900 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {pending ? 'Saving\u2026' : isEdit ? 'Save changes' : 'Create event'}
    </button>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-serif text-lg text-crimson-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  name, label, defaultValue, hint, error, required, placeholder, type = 'text',
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={
          'mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 ' +
          (error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20')
        }
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

function TextArea({
  name, label, defaultValue, error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        aria-invalid={!!error}
        className={
          'mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 ' +
          (error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20')
        }
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
