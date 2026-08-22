'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  const defaultAlbum = albums.find((a) => a.photos.length > 0) ?? albums[0];
  const [activeId, setActiveId] = useState(defaultAlbum?.id ?? null);

  const activeAlbum = albums.find((a) => a.id === activeId) ?? albums[0];

  if (albums.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-sand/40 p-12 text-center">
        <p className="font-serif text-lg text-maroon-800">
          {locale === 'en' ? 'No albums available yet' : 'कोई एल्बम उपलब्ध नहीं है'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky pill tabs — each pill carries its own background/blur/shadow
          so only the capsules float when this sticks on scroll, instead of
          a full-width band trailing behind them. */}
      <div className="sticky top-16 z-20 py-3">
        <div className="scrollbar-none flex gap-2.5 overflow-x-auto">
          {albums.map((album) => {
            const title = locale === 'en' && album.title_en ? album.title_en : album.title_hi;
            const active = album.id === activeId;
            return (
              <button
                key={album.id}
                onClick={() => setActiveId(album.id)}
                className={
                  'relative shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 font-serif text-sm font-medium backdrop-blur-md transition-all ' +
                  (active
                    ? 'text-ivory'
                    : 'border border-gold-500/40 bg-ivory/90 text-maroon-700 shadow-[0_1px_4px_-1px_rgba(88,10,45,0.2)] hover:border-gold-500 hover:bg-ivory hover:text-maroon-900')
                }
              >
                {active && (
                  <motion.span
                    layoutId="gallery-tab-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-maroon-800 shadow-[0_2px_6px_-1px_rgba(88,10,45,0.45)]"
                  />
                )}
                <span className="relative">
                  {title}
                  <span className={active ? 'ml-1.5 text-gold-300' : 'ml-1.5 text-maroon-500/70'}>
                    ({album.photos.length})
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo grid for the active album */}
      <AnimatePresence mode="wait">
        {activeAlbum && (
          <motion.div
            key={activeAlbum.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            {activeAlbum.photos.length === 0 ? (
              <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-sand/40 p-12 text-center">
                <p className="font-serif text-lg text-maroon-800">
                  {locale === 'en' ? 'No photos in this album yet' : 'इस एल्बम में अभी कोई फ़ोटो नहीं है'}
                </p>
              </div>
            ) : (
              <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 md:columns-4 lg:columns-5">
                {activeAlbum.photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative mb-3 block w-full break-inside-avoid overflow-hidden bg-sand shadow-[0_2px_10px_-4px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_18px_30px_-12px_rgba(88,10,45,0.45)] sm:mb-4"
                  >
                    {/* A single gold line traces the frame on hover — top edge
                        first, then right, bottom, left, like a border being
                        drawn in one continuous stroke. Photo stays full color
                        throughout; only the frame and a slight lift move. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image_url}
                      alt={photo.alt_text ?? ''}
                      loading="lazy"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="mx-auto block h-auto max-w-full select-none [-webkit-touch-callout:none]"
                    />
                    <span
                      className="pointer-events-none absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-gold-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute right-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gold-400 transition-transform delay-300 duration-300 ease-out group-hover:scale-y-100"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 bg-gold-400 transition-transform delay-[600ms] duration-300 ease-out group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute left-0 top-0 h-full w-[2px] origin-bottom scale-y-0 bg-gold-400 transition-transform delay-[900ms] duration-300 ease-out group-hover:scale-y-100"
                      aria-hidden="true"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
