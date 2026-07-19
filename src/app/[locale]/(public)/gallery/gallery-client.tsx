'use client';

import { useState, useEffect, useCallback } from 'react';

type Photo = {
  id: string;
  image_url: string;
  caption_hi: string | null;
  caption_en: string | null;
  alt_text: string | null;
};

type Album = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  cover_image_url: string | null;
  photos: Photo[];
};

export function GalleryClient({ albums, locale }: { albums: Album[]; locale: string }) {
  const [activeId, setActiveId] = useState(albums[0]?.id ?? null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeAlbum = albums.find((a) => a.id === activeId) ?? albums[0];

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    if (!activeAlbum) return;
    setLightboxIndex((i) => (i === null ? null : (i + 1) % activeAlbum.photos.length));
  }, [activeAlbum]);

  const goPrev = useCallback(() => {
    if (!activeAlbum) return;
    setLightboxIndex((i) => (i === null ? null : (i - 1 + activeAlbum.photos.length) % activeAlbum.photos.length));
  }, [activeAlbum]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  if (albums.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-white/60 p-12 text-center">
        <p className="font-serif text-lg text-crimson-800">
          {locale === 'en' ? 'No albums available yet' : 'कोई एल्बम उपलब्ध नहीं है'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky pill tabs — horizontally scrollable on any screen size */}
      <div className="sticky top-16 z-20 -mx-6 border-b border-gold-500/20 bg-ivory/95 px-6 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {albums.map((album) => {
            const title = locale === 'en' && album.title_en ? album.title_en : album.title_hi;
            const active = album.id === activeId;
            return (
              <button
                key={album.id}
                onClick={() => setActiveId(album.id)}
                className={
                  'shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-serif text-sm transition-all ' +
                  (active
                    ? 'bg-crimson-800 text-ivory shadow-sm'
                    : 'border border-gold-500/30 text-neutral-600 hover:border-gold-500 hover:text-crimson-800')
                }
              >
                {title}
                <span className="ml-1.5 opacity-60">({album.photos.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo grid for the active album */}
      {activeAlbum && (
        <div className="mt-8">
          {activeAlbum.photos.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-white/60 p-12 text-center">
              <p className="font-serif text-lg text-crimson-800">
                {locale === 'en' ? 'No photos in this album yet' : 'इस एल्बम में अभी कोई फ़ोटो नहीं है'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {activeAlbum.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt={photo.alt_text ?? ''}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <span className="text-2xl text-white opacity-0 transition-opacity group-hover:opacity-100">
                      ⛶
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {activeAlbum && lightboxIndex !== null && (
        <Lightbox
          photos={activeAlbum.photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Download */}
      <a
        href={photo.image_url}
        download
        onClick={(e) => e.stopPropagation()}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
      >
        ⬇ Download
      </a>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          aria-label="Next"
        >
          ›
        </button>
      )}

      {/* Image */}
      <div className="mx-auto max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image_url}
          alt={photo.alt_text ?? ''}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}
