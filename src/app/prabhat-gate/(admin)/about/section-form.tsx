'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionResult } from '@/lib/actions/about';
import type { PublicAboutVideo } from '@/lib/about';
import type { Database } from '@/types/database';

type Section = Database['public']['Tables']['about_sections']['Row'] & {
  videos: PublicAboutVideo[];
};

type Props = {
  section: Section;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function SectionForm({ section, action }: Props) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const errored = !!state && !state.ok;
  // Re-mounts the text fields once, right when an error comes back, so they pick up
  // whatever the admin had typed (via state.values) instead of losing it.
  const fieldsKey = errored ? 'retry' : 'initial';
  const echoed = errored ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-10">
      <Toast state={state} />

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

      <Section title="Photos" subtitle="Photo 1 sits beside the intro and opening text; photo 2 floats mid-way through the biography.">
        <div className="grid gap-6 sm:grid-cols-2">
          <PhotoDropzone
            name="photo_1_file"
            label="Photo 1"
            currentUrl={section.photo_1_url}
            aspect="aspect-[3/4]"
          />
          <PhotoDropzone
            name="photo_2_file"
            label="Photo 2"
            currentUrl={section.photo_2_url}
            aspect="aspect-[3/4]"
          />
        </div>
      </Section>

      <Section title="Titles">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            key={`title_hi-${fieldsKey}`}
            name="title_hi"
            label="Title (Hindi)"
            defaultValue={echoed?.title_hi ?? section.title_hi}
            error={state && !state.ok ? state.fieldErrors?.title_hi : undefined}
            required
          />
          <Field
            key={`title_en-${fieldsKey}`}
            name="title_en"
            label="Title (English)"
            defaultValue={echoed?.title_en ?? section.title_en ?? ''}
            error={state && !state.ok ? state.fieldErrors?.title_en : undefined}
          />
        </div>
      </Section>

      <Section title="Intro line" subtitle="A short pull-quote style line shown above the biography.">
        <TextArea
          key={`intro_hi-${fieldsKey}`}
          name="intro_hi"
          label="Intro (Hindi)"
          defaultValue={echoed?.intro_hi ?? section.intro_hi ?? ''}
          rows={2}
          error={state && !state.ok ? state.fieldErrors?.intro_hi : undefined}
        />
        <TextArea
          key={`intro_en-${fieldsKey}`}
          name="intro_en"
          label="Intro (English)"
          defaultValue={echoed?.intro_en ?? section.intro_en ?? ''}
          rows={2}
          error={state && !state.ok ? state.fieldErrors?.intro_en : undefined}
        />
      </Section>

      <Section
        title="Biography"
        subtitle="Put the cursor on a line and click H2 (or start the line with ##) to break the text into a titled section."
      >
        <TextArea
          key={`body_hi-${fieldsKey}`}
          name="body_hi"
          label="Body (Hindi)"
          defaultValue={echoed?.body_hi ?? section.body_hi ?? ''}
          rows={6}
          allowHeading
          error={state && !state.ok ? state.fieldErrors?.body_hi : undefined}
        />
        <TextArea
          key={`body_en-${fieldsKey}`}
          name="body_en"
          label="Body (English)"
          defaultValue={echoed?.body_en ?? section.body_en ?? ''}
          rows={6}
          allowHeading
          error={state && !state.ok ? state.fieldErrors?.body_en : undefined}
        />
      </Section>

      <Section
        title="YouTube videos"
        subtitle="Shown as cards at the bottom of this jivni — hover a card on the public site to preview it."
      >
        <VideoLinksEditor videos={section.videos} />
      </Section>

      <Section title="Visibility">
        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-500/50">
          <input
            key={`is_published-${fieldsKey}`}
            type="checkbox"
            name="is_published"
            defaultChecked={echoed ? echoed.is_published === 'true' : section.is_published}
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

function Toast({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  // Keying by the result's own content forces a fresh mount per distinct save
  // attempt, so ToastBubble can start visible and self-dismiss without ever
  // needing to compare against a previous render.
  const toastKey = state.ok ? 'ok' : `err:${state.error}`;
  return <ToastBubble key={toastKey} state={state} />;
}

function ToastBubble({ state }: { state: ActionResult }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const ok = state.ok;
  const text = ok ? 'Saved successfully.' : state.error;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 ' +
        (visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0') +
        ' ' +
        (ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')
      }
    >
      <span className="mt-0.5 text-base leading-none">{ok ? '✓' : '⚠'}</span>
      <div className="flex-1 text-sm">
        {text}
        {!ok && <span className="mt-0.5 block text-xs opacity-80">Nothing you typed was lost — fix and save again.</span>}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="text-lg leading-none opacity-50 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
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

function VideoLinksEditor({ videos }: { videos: PublicAboutVideo[] }) {
  const [rows, setRows] = useState<{ key: string; url: string }[]>(() =>
    videos.map((v) => ({ key: v.id, url: `https://www.youtube.com/watch?v=${v.youtube_video_id}` }))
  );

  function updateRow(key: string, url: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, url } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: `new-${Date.now()}`, url: '' }]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <input
            name="video_urls"
            type="url"
            value={row.url}
            onChange={(e) => updateRow(row.key, e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
          <button
            type="button"
            onClick={() => removeRow(row.key)}
            aria-label="Remove video"
            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:border-red-300 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
      >
        + Add {rows.length > 0 ? 'another' : 'a'} video
      </button>
      {rows.length === 0 && <p className="text-xs text-neutral-400">No videos attached yet.</p>}
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
  name, label, defaultValue, error, rows = 4, allowHeading = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  rows?: number;
  allowHeading?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyBold() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || 'bold text';
    el.value = el.value.slice(0, start) + `**${selected}**` + el.value.slice(end);
    el.focus();
    el.setSelectionRange(start + 2, start + 2 + selected.length);
  }

  // Toggles a "## " marker on the line the cursor is in — the public page
  // reads that as a section heading. Line-level (not a wrap-selection
  // marker like bold/link) since a heading is either on or off per line.
  function applyHeading() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const value = el.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = value.length;
    const line = value.slice(lineStart, lineEnd);
    const isHeading = line.startsWith('## ');
    const newLine = isHeading ? line.slice(3) : `## ${line}`;
    el.value = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    el.focus();
    const newPos = Math.max(lineStart, start + (isHeading ? -3 : 3));
    el.setSelectionRange(newPos, newPos);
  }

  function applyLink() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || 'link text';
    const url = window.prompt('Link URL (e.g. https://example.com or /about/some-page):', 'https://');
    if (!url) return;
    const inserted = `[${selected}](${url})`;
    el.value = el.value.slice(0, start) + inserted + el.value.slice(end);
    el.focus();
    el.setSelectionRange(start, start + inserted.length);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {allowHeading && (
            <button
              type="button"
              onClick={applyHeading}
              title="Turn this line into a heading (click again to undo)"
              className="rounded px-2 py-0.5 text-xs font-bold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              H2
            </button>
          )}
          <button
            type="button"
            onClick={applyBold}
            title="Bold the selected text"
            className="rounded px-2 py-0.5 text-xs font-bold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            B
          </button>
          <button
            type="button"
            onClick={applyLink}
            title="Turn the selected text into a link"
            className="rounded px-2 py-0.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            🔗
          </button>
        </div>
      </div>
      <textarea
        ref={ref}
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
      <p className="mt-1 text-xs text-neutral-400">
        Select text and click B to bold it, or 🔗 to turn it into a link.
        {allowHeading && ' Put the cursor on a line and click H2 to make it a section heading.'}
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
