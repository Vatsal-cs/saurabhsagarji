import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedBookBySlug, getPublicPdfUrl } from '@/lib/books';
import { BookReader } from './book-reader';

export const dynamicParams = true;
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: 'Read' };

export default async function BookReaderPage({ params }: Props) {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book || !book.pdf_url) notFound();

  const pdfUrl = getPublicPdfUrl(book.pdf_url);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 md:px-4 md:py-2">
        <Link
          href={`/books/${slug}`}
          className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-100"
        >
          ← <span className="hidden sm:inline">Back</span>
        </Link>
        <p className="truncate px-2 font-serif text-xs md:text-sm">{book.title_hi}</p>
        <div className="w-8 md:w-10" />
      </header>

      <main className="flex-1 overflow-hidden">
        <BookReader pdfUrl={pdfUrl} title={book.title_hi} />
      </main>
    </div>
  );
}
