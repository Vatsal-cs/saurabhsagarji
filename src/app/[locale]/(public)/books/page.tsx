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
  const books = await getPublishedBooks();
  const t = await getTranslations({ locale, namespace: 'Books' });
  const tDetail = await getTranslations({ locale, namespace: 'BookDetail' });

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
        </div>
      </div>
    </main>
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
