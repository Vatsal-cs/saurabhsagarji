import { getTranslations } from 'next-intl/server';
import { getPublishedBooks } from '@/lib/books';
import { Reveal } from '@/components/ui/reveal';
import { SoberTexture } from '@/components/ui/sober-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { BookCard } from './book-card';

export const metadata = { title: 'Publications' };

type Props = { params: Promise<{ locale: string }> };

export default async function BooksPage({ params }: Props) {
  const { locale } = await params;
  const [books, t, tDetail] = await Promise.all([
    getPublishedBooks(),
    getTranslations({ locale, namespace: 'Books' }),
    getTranslations({ locale, namespace: 'BookDetail' }),
  ]);

  return (
    <main className="relative min-h-full overflow-hidden bg-ivory">
      <SoberTexture />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {t('eyebrow')}
            </p>
            <SplitHeadline
              as="h1"
              text={t('heading')}
              className="mt-3 font-serif text-sm leading-snug tracking-tight text-maroon-800 sm:text-2xl md:text-3xl lg:text-4xl"
            />
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </Reveal>

          {books.length === 0 ? (
            <EmptyState title={t('emptyTitle')} body={t('emptyBody')} />
          ) : (
            <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-16 xl:grid-cols-5">
              {books.map((book, index) => (
                <BookCard key={book.id} book={book} readLabel={tDetail('read')} index={index} />
              ))}
            </div>
          )}

          {/* Publications contact strip — always the last element in the page's
              content flow, so it sits directly above the footer no matter how
              many books are listed above it. No fixed/sticky positioning. */}
          <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 px-6 py-6 text-center shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02] sm:px-8">
            <p className="font-serif text-base text-maroon-800/80">
              {locale === 'en'
                ? 'For information related to Publications, contact:'
                : 'प्रकाशन संबंधित जानकारी हेतु संपर्क करें:'}
            </p>
            <a
              href={`tel:+91${PUBLICATIONS_CONTACT_NUMBER}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-maroon-800 px-6 py-3 font-serif-en text-base font-medium text-ivory shadow-md transition-colors hover:bg-maroon-900"
            >
              <PhoneGlyph className="h-4 w-4" />
              {PUBLICATIONS_CONTACT_NUMBER}
            </a>
            <p className="mt-3 font-serif text-base font-semibold text-maroon-700">
              {locale === 'en' ? 'Sh. Manoj Jain' : 'श्रीमान मनोज जैन'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const PUBLICATIONS_CONTACT_NUMBER = '9810056286';

function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-ivory/60 p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-2xl">
        📖
      </div>
      <p className="font-serif text-lg text-maroon-800">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{body}</p>
    </div>
  );
}
