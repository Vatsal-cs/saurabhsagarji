'use client';

import { useState, useRef, useTransition } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadPhotos, deletePhoto } from '@/lib/actions/gallery';
import type { ActionResult } from '@/lib/actions/gallery';
import type { Database } from '@/types/database';

type Photo = Database['public']['Tables']['gallery_photos']['Row'];

export function PhotoManager({ albumId, photos }: { albumId: string; photos: Photo[] }) {
  const boundUpload = uploadPhotos.bind(null, albumId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(boundUpload, null);

  return (
    <div className="space-y-8">
      {state && !state.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      )}
      {state && state.ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          Photos uploaded.
        </div>
      )}

      <form action={formAction}>
        <MultiDropzone />
        <div className="mt-4 flex justify-end">
          <SubmitButton />
        </div>
      </form>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} albumId={albumId} />
          ))}
        </div>
      )}
    </div>
  );
}

function MultiDropzone() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFiles(list: FileList | null) {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setFiles(imgs);
    if (inputRef.current) {
      const dt = new DataTransfer();
      imgs.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    applyFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ' +
          (dragging
            ? 'border-gold-500 bg-gold-400/10'
            : 'border-neutral-300 bg-neutral-50 hover:border-gold-500 hover:bg-gold-400/5')
        }
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/20 text-2xl text-gold-600">
          ⬆
        </div>
        {files.length > 0 ? (
          <p className="text-sm font-medium text-emerald-700">
            ✓ {files.length} photo{files.length === 1 ? '' : 's'} ready to upload
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-700">Drop photos here</p>
            <p className="mt-1 text-xs text-neutral-500">
              or click to browse · select multiple · JPG / PNG · max 50 MB each
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        name="photos"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => applyFiles(e.target.files)}
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
      className="rounded-full bg-crimson-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-crimson-900 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {pending ? 'Uploading…' : 'Upload photos'}
    </button>
  );
}

function PhotoTile({ photo, albumId }: { photo: Photo; albumId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [removed, setRemoved] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePhoto(photo.id, albumId);
      if (res.ok) setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.image_url} alt={photo.alt_text ?? ''} className="h-full w-full object-cover" />

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />

      <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {confirming ? (
          <div className="flex gap-1 rounded-full bg-white/95 px-2 py-1 text-xs shadow">
            <button onClick={handleDelete} disabled={isPending} className="font-medium text-red-600 hover:underline">
              Yes
            </button>
            <span className="text-neutral-300">|</span>
            <button onClick={() => setConfirming(false)} className="text-neutral-600 hover:underline">
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-600 shadow transition-transform hover:scale-105"
            aria-label="Delete photo"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
