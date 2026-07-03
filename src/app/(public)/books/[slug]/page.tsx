import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { getPublishedBookBySlug, getPublishedBooks } from '@/lib/books';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const books = await getPublishedBooks();
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
          <Link href="/books" className="hover:text-neutral-900">
            ← पुस्तकें / All books
          </Link>
        </nav>

        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_2fr]">
          <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-neutral-100">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt={book.title_hi}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span className="font-serif text-6xl text-neutral-300">📖</span>
            )}
          </div>

          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {book.title_hi}
            </h1>
            {book.title_en && (
              <p className="mt-2 font-serif text-xl text-neutral-500">{book.title_en}</p>
            )}
            {book.publication_year && (
              <p className="mt-4 text-xs uppercase tracking-widest text-neutral-400">
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
              {book.purchase_url && (
                 <a
                  href={book.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
                >
                  Purchase / खरीदें
                </a>
              )}
              {book.download_url && (
                <a
                  href={book.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-neutral-300 bg-white px-5 py-2 text-sm text-neutral-800 transition-colors hover:bg-neutral-100"
                >
                  Download / डाउनलोड करें
                </a>
              )}
              {book.preview_pdf_url && (
                <a
                  href={book.preview_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-neutral-300 bg-white px-5 py-2 text-sm text-neutral-800 transition-colors hover:bg-neutral-100"
                >
                  Preview / झलक
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </Container>
  );
}