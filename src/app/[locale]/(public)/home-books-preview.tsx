'use client';

import { useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { WarmTexture } from '@/components/ui/warm-texture';
import { Reveal } from '@/components/ui/reveal';
import { SplitHeadline } from '@/components/motion/split-headline';
import type { PublicBook } from '@/lib/books';
import type { Language } from '@/lib/site-content';

// Tuned so the fan reads well from a couple of books up to a couple dozen —
// distance between adjacent card centers, how many index-steps stay visible
// either side of center, and how sharply they rotate/dip/shrink as they fan out.
const SPACING = 150;
const MAX_VISIBLE = 2;
const ANGLE_STEP = 12;
const ARC = 14;
// A gesture that moves less than this (px) is a tap, not a drag — anything past
// it means the pointer genuinely traveled, so the click that follows on release
// shouldn't be allowed to open the book underneath it.
const DRAG_CLICK_THRESHOLD = 6;

export function HomeBooksPreview({ books, lang }: { books: PublicBook[]; lang: Language }) {
  const count = books.length;
  // No min/max clamp — progress is free to run past either end. Every place
  // that needs an actual book (the current title, wrapping the per-card
  // offset below) reduces it mod `count` instead, so dragging or arrowing
  // past the last book loops straight back to the first and vice versa,
  // rather than stopping dead.
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const hasDraggedRef = useRef(false);

  function handleDragStart() {
    hasDraggedRef.current = false;
  }

  function handlePan(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > DRAG_CLICK_THRESHOLD) {
      hasDraggedRef.current = true;
    }
    const next = progressRef.current - info.delta.x / SPACING;
    progressRef.current = next;
    setProgress(next);
  }

  function handlePanEnd() {
    const snapped = Math.round(progressRef.current);
    progressRef.current = snapped;
    setProgress(snapped);
  }

  function handleCoverClick(e: React.MouseEvent) {
    if (hasDraggedRef.current) e.preventDefault();
  }

  function step(delta: 1 | -1) {
    const next = Math.round(progressRef.current) + delta;
    progressRef.current = next;
    setProgress(next);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  }

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <WarmTexture />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SplitHeadline
            as="h2"
            onScroll
            text={lang === 'en' ? "Acharya Shri's Writings" : 'आचार्य श्री की लेखनी'}
            className="font-serif text-4xl leading-tight text-maroon-800 sm:text-5xl"
          />
          {/* A filled, continuously-animated pill — the plain outline button was
              blending into the page, easy to miss for anyone not already looking
              for it. The rotating gold border + soft pulse behind it keep it
              visually "alive" so it draws the eye on its own. */}
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1.5 animate-pulse rounded-full bg-gold-400/50 blur-md"
              aria-hidden="true"
            />
            <div
              className="animate-spin-border relative rounded-full p-[2px] shadow-[0_10px_25px_-10px_rgba(88,10,45,0.6)]"
              style={{
                backgroundImage:
                  'conic-gradient(from var(--border-angle), var(--color-gold-500), transparent 25%, var(--color-gold-400) 50%, transparent 75%, var(--color-gold-500))',
              }}
            >
              <Link
                href="/books"
                className="flex items-center gap-2 rounded-full bg-maroon-800 px-6 py-2.5 font-serif-en text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-maroon-900"
              >
                {lang === 'en' ? 'View all publications' : 'सभी प्रकाशन देखें'} →
              </Link>
            </div>
          </div>
        </div>

        <Reveal delay={100}>
          {/* Drag hint — sits above the deck now instead of centered on top of the front
              cover, so it never covers/crops the book itself. */}
          <div className="mt-14 flex items-center justify-center gap-2 text-maroon-800/60">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7L18 12L13 17M11 7L6 12L11 17" />
            </svg>
            <span className="font-serif-en text-xs uppercase tracking-[0.2em]">
              {lang === 'en' ? 'Drag to browse' : 'ब्राउज़ करने के लिए खींचें'}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-4 w-4 shrink-0 rotate-180"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7L18 12L13 17M11 7L6 12L11 17" />
            </svg>
          </div>

          {/* Drag deck — a wide invisible pan surface reads the drag gesture (mouse or
              touch) and drives a continuous index `progress`; each cover's own position,
              rotation, scale and opacity are derived from its distance from that value, so
              it scales to however many books exist without any per-item wiring. Left/right
              arrow buttons sit just outside it as plain siblings (not inside the draggable
              element) so a click never gets mistaken for the start of a drag — an easier,
              more obvious way to browse for anyone who wouldn't think to drag. */}
          <div className="relative mt-6">
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={lang === 'en' ? 'Previous book' : 'पिछली पुस्तक'}
                className="absolute left-2 top-1/2 z-[110] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/50 bg-ivory/90 text-maroon-800 shadow-md backdrop-blur transition-all hover:-translate-x-0.5 hover:-translate-y-1/2 hover:border-gold-500 hover:bg-ivory sm:left-4 sm:h-12 sm:w-12"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            )}
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={lang === 'en' ? 'Next book' : 'अगली पुस्तक'}
                className="absolute right-2 top-1/2 z-[110] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/50 bg-ivory/90 text-maroon-800 shadow-md backdrop-blur transition-all hover:-translate-y-1/2 hover:translate-x-0.5 hover:border-gold-500 hover:bg-ivory sm:right-4 sm:h-12 sm:w-12"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}

          <motion.div
            role="region"
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDrag={handlePan}
            onDragEnd={handlePanEnd}
            className="relative isolate h-[320px] cursor-grab touch-pan-y select-none overflow-hidden focus:outline-none active:cursor-grabbing sm:h-[400px]"
          >
            {/* dashed tick marks fanning either side of the handle, purely decorative */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[70%] max-w-md -translate-x-1/2 -translate-y-1/2 opacity-40"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to right, var(--color-gold-500) 0 2px, transparent 2px 12px)',
              }}
              aria-hidden="true"
            />

            {books.map((book, i) => {
              // Shortest signed distance around the circular deck — book 0
              // and the last book are neighbors, not opposite ends, so the
              // fan wraps smoothly past either edge instead of stopping.
              let offset = i - progress;
              offset -= Math.round(offset / count) * count;
              const abs = Math.abs(offset);
              if (abs > MAX_VISIBLE) return null;
              const title = lang === 'en' && book.title_en ? book.title_en : book.title_hi;
              return (
                <div
                  key={book.id}
                  className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 sm:w-52"
                  style={{ zIndex: 100 - Math.round(abs * 10) }}
                >
                  <motion.div
                    animate={{
                      x: offset * SPACING,
                      y: abs * abs * ARC,
                      rotate: offset * ANGLE_STEP,
                      scale: Math.max(1 - abs * 0.14, 0.55),
                      opacity: Math.max(1 - abs * 0.3, 0),
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                  >
                    <Link
                      href={`/books/${book.slug}`}
                      className="group block"
                      draggable={false}
                      onClick={handleCoverClick}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand shadow-[0_25px_45px_-20px_rgba(88,10,45,0.45)] ring-1 ring-black/5">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={title}
                            fill
                            draggable={false}
                            priority
                            sizes="208px"
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-maroon-800 via-maroon-900 to-ink">
                            <span className="text-3xl text-gold-400">📖</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
          </div>

          {/* current book's title, since the fan itself has no room for captions */}
          {(() => {
            const currentBook = books[((Math.round(progress) % count) + count) % count];
            return currentBook ? (
              <p className="mt-2 text-center font-serif text-base text-maroon-800 sm:text-lg">
                {lang === 'en' && currentBook.title_en ? currentBook.title_en : currentBook.title_hi}
              </p>
            ) : null;
          })()}
        </Reveal>
      </div>
    </section>
  );
}
