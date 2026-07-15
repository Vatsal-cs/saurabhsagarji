import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { getPublishedBookBySlug, getPublishedBooksStatic } from '@/lib/books';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const books = await getPublishedBooksStatic();
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book) return { title: 'Book not found' };

  return {
    title: book.title_en ?? book.title_hi,
    description: book.description_en ?? book.description_hi ?? undefined,
    openGraph: {
      title: book.title_en ?? book.title_hi,
      description: book.description_en ?? book.description_hi ?? undefined,
      images: book.cover_image_url ? [book.cover_image_url] : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);

  if (!book) notFound();

  return (
    <Container>
      <article className="py-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-500">
          <Link href="/books" className="transition-colors hover:text-crimson-800">
            ← पुस्तकें / All books
          </Link>
        </nav>

        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-gold-500/30 bg-neutral-100 shadow-lg">
            <div className="flex aspect-[3/4] items-center justify-center">
              {book.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover_image_url}
                  alt={book.title_hi}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-6xl text-neutral-300">📖</span>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-crimson-800 sm:text-5xl">
              {book.title_hi}
            </h1>
            {book.title_en && (
              <p className="mt-2 font-serif text-xl text-neutral-500">{book.title_en}</p>
            )}
            {book.publication_year && (
              <p className="mt-4 text-xs uppercase tracking-widest text-gold-600">
                Published {book.publication_year}
              </p>
            )}

            {book.description_hi && (
              <p className="mt-8 text-lg leading-relaxed text-neutral-800">
                {book.description_hi}
              </p>
            )}
            {book.description_en && (
              <p className="mt-4 text-base leading-relaxed text-neutral-600">
                {book.description_en}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {book.pdf_url && (
                <Link
                  href={`/books/${book.slug}/read`}
                  className="rounded-full bg-crimson-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-crimson-900 hover:-translate-y-0.5"
                >
                  पढ़ें / Read
                </Link>
              )}
              {book.pdf_url && (
                <a
                  href={`/api/book-pdf/${book.slug}?download=1`}
                  className="rounded-full border border-gold-500 px-6 py-2.5 text-sm font-medium text-crimson-800 transition-all hover:bg-gold-400/10 hover:-translate-y-0.5"
                >
                  डाउनलोड / Download
                </a>
              )}
              {book.purchase_url && (
                <a
                  href={book.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100 hover:-translate-y-0.5"
                >
                  खरीदें / Purchase
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </Container>
  );
}
