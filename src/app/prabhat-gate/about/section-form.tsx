'use client';

import { useActionState, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionResult } from '@/lib/actions/about';
import type { Database } from '@/types/database';

type Section = Database['public']['Tables']['about_sections']['Row'];

type Props = {
  section: Section;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function SectionForm({ section, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

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

      <input type="hidden" name="slug" value={section.slug} />
      <input type="hidden" name="display_order" value={section.display_order} />

      <Section title="Photos" subtitle="Photo 1 is the large hero band. Photo 2 sits beside the biography text.">
        <div className="grid gap-6 sm:grid-cols-2">
          <PhotoDropzone
            name="photo_1_file"
            label="Photo 1 — hero band"
            currentUrl={section.photo_1_url}
            aspect="aspect-video"
          />
          <PhotoDropzone
            name="photo_2_file"
            label="Photo 2 — beside biography"
            currentUrl={section.photo_2_url}
            aspect="aspect-[3/4]"
          />
        </div>
      </Section>

      <Section title="Titles">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="title_hi"
            label="Title (Hindi)"
            defaultValue={section.title_hi}
            error={state && !state.ok ? state.fieldErrors?.title_hi : undefined}
            required
          />
          <Field
            name="title_en"
            label="Title (English)"
            defaultValue={section.title_en ?? ''}
            error={state && !state.ok ? state.fieldErrors?.title_en : undefined}
          />
        </div>
      </Section>

      <Section title="Intro line" subtitle="A short pull-quote style line shown above the biography.">
        <TextArea
          name="intro_hi"
          label="Intro (Hindi)"
          defaultValue={section.intro_hi ?? ''}
          rows={2}
          error={state && !state.ok ? state.fieldErrors?.intro_hi : undefined}
        />
        <TextArea
          name="intro_en"
          label="Intro (English)"
          defaultValue={section.intro_en ?? ''}
          rows={2}
          error={state && !state.ok ? state.fieldErrors?.intro_en : undefined}
        />
      </Section>

      <Section title="Biography">
        <TextArea
          name="body_hi"
          label="Body (Hindi)"
          defaultValue={section.body_hi ?? ''}
          rows={6}
          error={state && !state.ok ? state.fieldErrors?.body_hi : undefined}
        />
        <TextArea
          name="body_en"
          label="Body (English)"
          defaultValue={section.body_en ?? ''}
          rows={6}
          error={state && !state.ok ? state.fieldErrors?.body_en : undefined}
        />
      </Section>

      <Section title="Visibility">
        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-500/50">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={section.is_published}
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-crimson-800 focus:ring-crimson-800"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Publish this section</span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              When enabled, this page appears under परिचय in the public site.
            </span>
          </span>
        </label>
      </Section>

      <div className="flex justify-end border-t border-neutral-200 pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}

function PhotoDropzone({
  name,
  label,
  currentUrl,
  aspect,
}: {
  name: string;
  label: string;
  currentUrl: string | null;
  aspect: string;
}) {
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
      <p className="mb-2 text-sm font-medium text-neutral-700">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          `group relative ${aspect} cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ` +
          (dragging
            ? 'border-gold-500 bg-gold-400/10'
            : 'border-neutral-300 bg-neutral-50 hover:border-gold-500 hover:bg-gold-400/5')
        }
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-neutral-900">
                Change photo
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/20 text-xl text-gold-600">
              ⬆
            </div>
            <p className="text-sm font-medium text-neutral-700">Drop photo here</p>
            <p className="mt-1 text-xs text-neutral-500">or click to browse · max 15 MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        onChange={(e) => applyFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-crimson-800 px-7 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-crimson-900 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {pending ? 'Saving\u2026' : 'Save changes'}
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
  name, label, defaultValue, error, required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
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
        defaultValue={defaultValue}
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

function TextArea({
  name, label, defaultValue, error, rows = 4,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  rows?: number;
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
        rows={rows}
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
