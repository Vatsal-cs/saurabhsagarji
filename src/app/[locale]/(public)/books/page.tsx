import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPublishedBooks } from '@/lib/books';
import { Reveal } from '@/components/ui/reveal';

export const metadata = { title: 'Books' };

type Props = { params: Promise<{ locale: string }> };

export default async function BooksPage({ params }: Props) {
  const { locale } = await params;
  const books = await getPublishedBooks();
  const t = await getTranslations({ locale, namespace: 'Books' });
  const tDetail = await getTranslations({ locale, namespace: 'BookDetail' });

  return (
    <main className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-crimson-800 sm:text-5xl">
              {t('heading')}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
            <p className="mx-auto mt-5 max-w-lg text-neutral-600">{t('subtitle')}</p>
          </Reveal>

          {books.length === 0 ? (
            <EmptyState title={t('emptyTitle')} body={t('emptyBody')} />
          ) : (
            <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-16 xl:grid-cols-5">
              {books.map((book, i) => (
                <Reveal key={book.id} delay={(i % 4) * 90}>
                  <BookCard book={book} readLabel={tDetail('read')} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BookCard({
  book,
  readLabel,
}: {
  book: Awaited<ReturnType<typeof getPublishedBooks>>[number];
  readLabel: string;
}) {
  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-neutral-100 shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
        <div className="aspect-[3/4]">
          {book.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_image_url}
              alt={book.title_hi}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-crimson-800 via-crimson-900 to-ink px-4 text-center">
              <span className="text-3xl text-gold-400">📖</span>
              <span className="font-serif text-xs leading-snug text-gold-200/80 line-clamp-3">
                {book.title_hi}
              </span>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mb-4 rounded-full bg-ivory/95 px-4 py-1.5 text-xs font-medium text-crimson-800 shadow-sm">
            {readLabel}
          </span>
        </div>

        <span className="pointer-events-none absolute left-2 top-2 text-xs text-gold-400/0 transition-colors duration-300 group-hover:text-gold-400/90">❁</span>
        <span className="pointer-events-none absolute right-2 top-2 text-xs text-gold-400/0 transition-colors duration-300 group-hover:text-gold-400/90">❁</span>
      </div>

      <div className="mt-3.5 px-0.5">
        <h2 className="line-clamp-2 font-serif text-base leading-snug tracking-tight text-neutral-900 transition-colors group-hover:text-crimson-800 sm:text-lg">
          {book.title_hi}
        </h2>
        {book.title_en && (
          <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 sm:text-sm">{book.title_en}</p>
        )}
        {book.publication_year && (
          <p className="mt-1.5 text-[10px] uppercase tracking-widest text-gold-600 sm:text-xs">
            {book.publication_year}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-white/60 p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-2xl">
        📖
      </div>
      <p className="font-serif text-lg text-crimson-800">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{body}</p>
    </div>
  );
}
