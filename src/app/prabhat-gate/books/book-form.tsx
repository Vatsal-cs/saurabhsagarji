'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { BookInput } from '@/lib/schemas/book';
import type { ActionResult } from '@/lib/actions/books';
import type { Database } from '@/types/database';

type Book = Database['public']['Tables']['books']['Row'];

type Props = {
  book?: Book;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function BookForm({ book, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-8">
      {state && !state.ok && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      )}

      {state && state.ok && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
          Saved.
        </div>
      )}

      <Section title="Basics">
        <Field
          name="slug"
          label="Slug"
          placeholder="shanti-ka-marg"
          defaultValue={book?.slug}
          hint="Lowercase letters, numbers, and hyphens only. Appears in the URL."
          error={state && !state.ok ? state.fieldErrors?.slug : undefined}
          required
        />
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
        <Field
          name="publication_year"
          label="Publication year"
          type="number"
          placeholder="2024"
          defaultValue={book?.publication_year?.toString() ?? ''}
          error={state && !state.ok ? state.fieldErrors?.publication_year : undefined}
        />
      </Section>

      <Section title="Description">
        <TextArea
          name="description_hi"
          label="Description (Hindi)"
          defaultValue={book?.description_hi ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_hi : undefined}
        />
        <TextArea
          name="description_en"
          label="Description (English)"
          defaultValue={book?.description_en ?? ''}
          error={state && !state.ok ? state.fieldErrors?.description_en : undefined}
        />
      </Section>

      <Section title="Files and links">
        <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          The cover image is generated automatically from the first page of the uploaded PDF.
        </p>
        <FileField
          name="pdf_file"
          label="Book PDF upload"
          accept="application/pdf"
          currentPath={book?.pdf_url}
          hint="PDF only. Max 50 MB. Uploaded PDF becomes the book that readers can flip through on-site."
        />
        <Field
          name="pdf_url"
          label="…or paste PDF path/URL"
          defaultValue={book?.pdf_url ?? ''}
          hint="Advanced: existing storage path or external URL."
          error={state && !state.ok ? state.fieldErrors?.pdf_url : undefined}
        />

        <Field
          name="preview_pdf_url"
          label="Preview PDF URL (optional)"
          defaultValue={book?.preview_pdf_url ?? ''}
          error={state && !state.ok ? state.fieldErrors?.preview_pdf_url : undefined}
        />
        <Field
          name="purchase_url"
          label="Purchase URL"
          defaultValue={book?.purchase_url ?? ''}
          error={state && !state.ok ? state.fieldErrors?.purchase_url : undefined}
        />
        <Field
          name="download_url"
          label="Download URL"
          defaultValue={book?.download_url ?? ''}
          error={state && !state.ok ? state.fieldErrors?.download_url : undefined}
        />
      </Section>

      <Section title="Publish">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={book?.is_published ?? false}
            className="mt-1 h-4 w-4 rounded border-neutral-300"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Published</span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              When checked, this book appears on the public /books page.
            </span>
          </span>
        </label>
      </Section>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link href="/prabhat-gate/books" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to all books
        </Link>
        <SubmitButton isEdit={!!book} />
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create book'}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-serif text-lg text-neutral-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
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
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={
          'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ' +
          (error
            ? 'border-red-400 focus:border-red-600 focus:ring-red-600'
            : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900')
        }
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1 text-xs text-neutral-500">
          {hint}
        </p>
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
        rows={4}
        aria-invalid={!!error}
        className={
          'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ' +
          (error
            ? 'border-red-400 focus:border-red-600 focus:ring-red-600'
            : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900')
        }
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function FileField({
    name,
    label,
    accept,
    currentUrl,
    currentPath,
    hint,
  }: {
    name: string;
    label: string;
    accept: string;
    currentUrl?: string | null;
    currentPath?: string | null;
    hint?: string;
  }) {
    const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
    const [filename, setFilename] = useState<string | null>(null);
    const isImage = accept.startsWith('image/');
  
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setFilename(file.name);
      if (isImage) setPreview(URL.createObjectURL(file));
    }
  
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
  
        <div className="mt-1 flex items-start gap-4">
          {isImage && preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-16 rounded border border-neutral-200 object-cover"
            />
          )}
          <div className="flex-1">
            <input
              id={name}
              name={name}
              type="file"
              accept={accept}
              onChange={onChange}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-neutral-700 file:hover:bg-neutral-50"
            />
            {filename && (
              <p className="mt-1 text-xs text-emerald-700">Ready to upload: {filename}</p>
            )}
            {!filename && currentPath && !isImage && (
              <p className="mt-1 text-xs text-neutral-500">Currently: {currentPath}</p>
            )}
            {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
          </div>
        </div>
      </div>
    );
  }