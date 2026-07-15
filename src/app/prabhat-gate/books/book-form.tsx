'use client';

import { useActionState, useState, useRef, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actions/books';
import type { Database } from '@/types/database';

type Book = Database['public']['Tables']['books']['Row'];

type Props = {
  book?: Book;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function BookForm({ book, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const isEdit = !!book;

  // Track whether a cover exists (either already on the book, or freshly picked)
  const [hasCover, setHasCover] = useState<boolean>(!!book?.cover_image_url);
  const [coverError, setCoverError] = useState<string | null>(null);

  function handleSubmitGuard(e: React.FormEvent<HTMLFormElement>) {
    if (!hasCover) {
      e.preventDefault();
      setCoverError('A cover image is required.');
      // scroll the cover zone into view
      document.getElementById('cover-zone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmitGuard} className="space-y-10">
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

      {/* ── Files: cover + pdf, side by side ───────────────── */}
      <Section title="Book files" subtitle="Upload the cover image and the book PDF.">
        <div className="grid gap-6 sm:grid-cols-2">
          <CoverDropzone
            currentUrl={book?.cover_image_url ?? null}
            onCoverChange={(has) => {
              setHasCover(has);
              if (has) setCoverError(null);
            }}
            error={coverError ?? (state && !state.ok ? state.fieldErrors?.cover_image_url : undefined)}
          />
          <PdfDropzone currentPath={book?.pdf_url ?? null} />
        </div>
      </Section>

      {/* ── Details ─────────────────────────────────────────── */}
      <Section title="Details" subtitle="Titles, description, and metadata.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="title_hi"
            label="Title (Hindi)"
            placeholder="शांति का मार्ग"
            defaultValue={book?.title_hi}
            error={state && !state.ok ? state.fieldErrors?.title_hi : undefined}
            required
          />
          <Field
            name="title_en"
            label="Title (English)"
            placeholder="The Path of Peace"
            defaultValue={book?.title_en ?? ''}
            error={state && !state.ok ? state.fieldErrors?.title_en : undefined}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <SlugField
            defaultValue={book?.slug}
            error={state && !state.ok ? state.fieldErrors?.slug : undefined}
          />
          <Field
            name="publication_year"
            label="Year"
            type="number"
            placeholder="2024"
            defaultValue={book?.publication_year?.toString() ?? ''}
            error={state && !state.ok ? state.fieldErrors?.publication_year : undefined}
          />
        </div>

        <TextArea
          name="description_hi"
          label="Description (Hindi)"
          placeholder="इस पुस्तक के बारे में..."
          defaultValue={book?.description_hi ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_hi : undefined}
        />
        <TextArea
          name="description_en"
          label="Description (English)"
          placeholder="About this book..."
          defaultValue={book?.description_en ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_en : undefined}
        />
      </Section>

      {/* ── Publish ─────────────────────────────────────────── */}
      <Section title="Visibility">
        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-500/50">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={book?.is_published ?? false}
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-crimson-800 focus:ring-crimson-800"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Publish this book</span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              When enabled, the book appears publicly on the पुस्तकें / Books page.
            </span>
          </span>
        </label>
      </Section>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link
          href="/prabhat-gate/books"
          className="text-sm text-neutral-600 transition-colors hover:text-crimson-800"
        >
          ← Back to all books
        </Link>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}

/* ============================================================
   Cover dropzone — drag & drop, live image preview, required
   ============================================================ */
function CoverDropzone({
  currentUrl,
  onCoverChange,
  error,
}: {
  currentUrl: string | null;
  onCoverChange: (hasCover: boolean) => void;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      setPreview(URL.createObjectURL(file));
      onCoverChange(true);
    },
    [onCoverChange]
  );

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    applyFile(e.target.files?.[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      // reflect dropped file into the actual input so it submits
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      applyFile(file);
    }
  }

  return (
    <div id="cover-zone">
      <p className="mb-2 text-sm font-medium text-neutral-700">
        Cover image <span className="text-red-500">*</span>
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          'group relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ' +
          (error
            ? 'border-red-400 bg-red-50'
            : dragging
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
            <p className="mt-1 text-xs text-neutral-500">or click to browse · JPG / PNG · max 5&nbsp;MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        name="cover_image_file"
        type="file"
        accept="image/*"
        onChange={onInput}
        className="hidden"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ============================================================
   PDF dropzone — drag & drop, filename chip
   ============================================================ */
function PdfDropzone({ currentPath }: { currentPath: string | null }) {
  const [filename, setFilename] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== 'application/pdf') return;
    setFilename(file.name);
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
      <p className="mb-2 text-sm font-medium text-neutral-700">
        Book PDF {!currentPath && <span className="text-red-500">*</span>}
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          'flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ' +
          (dragging
            ? 'border-gold-500 bg-gold-400/10'
            : 'border-neutral-300 bg-neutral-50 hover:border-gold-500 hover:bg-gold-400/5')
        }
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-crimson-800/10 text-2xl">
          📄
        </div>
        {filename ? (
          <p className="text-sm font-medium text-emerald-700">✓ {filename}</p>
        ) : currentPath ? (
          <>
            <p className="text-sm font-medium text-neutral-700">PDF already uploaded</p>
            <p className="mt-1 text-xs text-neutral-500">Drop a new file to replace it</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-700">Drop PDF here</p>
            <p className="mt-1 text-xs text-neutral-500">or click to browse · max 50&nbsp;MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        name="pdf_file"
        type="file"
        accept="application/pdf"
        onChange={(e) => applyFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}

/* ============================================================
   Slug field — auto-suggests nothing but styled to match
   ============================================================ */
function SlugField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  return (
    <Field
      name="slug"
      label="URL slug"
      placeholder="shanti-ka-marg"
      defaultValue={defaultValue}
      hint="Lowercase, hyphens only. Becomes /books/your-slug"
      error={error}
      required
    />
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
      {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create book'}
    </button>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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
  name, label, defaultValue, error, placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        rows={4}
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