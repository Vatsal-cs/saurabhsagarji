'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reorderBooks } from '@/lib/actions/books';

type ReorderBook = {
  id: string;
  title_hi: string;
  title_en: string | null;
  cover_image_url: string | null;
};

export function BookReorderModal({ books }: { books: ReorderBook[] }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<ReorderBook[]>(books);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function openModal() {
    setOrder(books);
    setError(null);
    setOpen(true);
  }

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((prev) => {
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    moveTo(dragIndex.current, index);
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await reorderBooks(order.map((b) => b.id));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  // Escape closes the modal, matching standard dialog behavior.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Reorder books
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Reorder books"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="font-serif text-xl text-neutral-900">Reorder books</h2>
                <p className="mt-0.5 text-sm text-neutral-500">
                  Drag a cover to move it, or use the arrows. This is the order books appear in on the public site.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {order.map((book, index) => (
                  <div
                    key={book.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="group relative cursor-grab select-none rounded-lg border border-neutral-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                  >
                    <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/80 text-xs font-medium text-white">
                      {index + 1}
                    </span>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-neutral-100">
                      {book.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_image_url}
                          alt=""
                          draggable={false}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">
                          📖
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-neutral-800">{book.title_hi}</p>

                    <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => moveTo(index, index - 1)}
                        disabled={index === 0}
                        aria-label="Move earlier"
                        className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-600 shadow ring-1 ring-neutral-200 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-0"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTo(index, index + 1)}
                        disabled={index === order.length - 1}
                        aria-label="Move later"
                        className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-600 shadow ring-1 ring-neutral-200 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-0"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-md px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
