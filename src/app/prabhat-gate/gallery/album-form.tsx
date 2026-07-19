'use client';

import { useActionState, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actions/gallery';
import type { Database } from '@/types/database';

type Album = Database['public']['Tables']['gallery_albums']['Row'];

type Props = {
  album?: Album;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function AlbumForm({ album, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const isEdit = !!album;

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

      <Section title="Cover image" subtitle="Shown on the gallery tab and admin list.">
        <CoverDropzone currentUrl={album?.cover_image_url ?? null} />
      </Section>

      <Section title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="title_hi"
            label="Title (Hindi)"
            placeholder="जैनाचार्य श्री सौरभ सागर जी"
            defaultValue={album?.title_hi}
            error={state && !state.ok ? state.fieldErrors?.title_hi : undefined}
            required
          />
          <Field
            name="title_en"
            label="Title (English)"
            placeholder="Jainacharya Shree Saurabh Sagar Ji"
            defaultValue={album?.title_en ?? ''}
            error={state && !state.ok ? state.fieldErrors?.title_en : undefined}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <Field
            name="slug"
            label="URL slug"
            placeholder="saurabh-sagar-ji"
            defaultValue={album?.slug}
            hint="Lowercase, hyphens only."
            error={state && !state.ok ? state.fieldErrors?.slug : undefined}
            required
          />
          <Field
            name="album_date"
            label="Date (optional)"
            type="date"
            defaultValue={album?.album_date ?? ''}
            error={state && !state.ok ? state.fieldErrors?.album_date : undefined}
          />
        </div>

        <TextArea
          name="description_hi"
          label="Description (Hindi)"
          defaultValue={album?.description_hi ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_hi : undefined}
        />
        <TextArea
          name="description_en"
          label="Description (English)"
          defaultValue={album?.description_en ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_en : undefined}
        />
      </Section>

      <Section title="Visibility">
        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-500/50">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={album?.is_published ?? false}
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-crimson-800 focus:ring-crimson-800"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Publish this album</span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              When enabled, the album and its photos appear on the public चित्र / Gallery page.
            </span>
          </span>
        </label>
      </Section>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link href="/prabhat-gate/gallery" className="text-sm text-neutral-600 transition-colors hover:text-crimson-800">
          ← Back to albums
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
              ⬆
            </div>
            <p className="text-sm font-medium text-neutral-700">Drop cover here</p>
            <p className="mt-1 text-xs text-neutral-500">or click to browse · JPG / PNG · max 50 MB</p>
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
      {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create album'}
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
