import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getPublishedBooks } from '@/lib/books';

export const metadata = { title: 'Books' };

export default async function BooksPage() {
  const books = await getPublishedBooks();

  return (
    <Container>
      <div className="py-16">
        <header className="mb-12 text-center">
          <p className="font-serif text-xs uppercase tracking-widest text-saffron-700">
            पुस्तकें · Books
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
            गुरुजी की पुस्तकें
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            Explore Guruji's writings on spirituality, devotion, and inner peace.
          </p>
        </header>

        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {books.map((book) => (
              <li key={book.id}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}

function BookCard({ book }: { book: Awaited<ReturnType<typeof getPublishedBooks>>[number] }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group block rounded-lg border border-neutral-200 bg-white p-6 transition-colors hover:border-saffron-400"
    >
      <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-neutral-100">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_image_url}
            alt={book.title_hi}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <span className="font-serif text-4xl text-neutral-300">📖</span>
        )}
      </div>
      <div className="mt-4">
        <h2 className="font-serif text-xl leading-tight tracking-tight text-neutral-900 group-hover:text-saffron-700">
          {book.title_hi}
        </h2>
        {book.title_en && (
          <p className="mt-1 font-serif text-sm text-neutral-500">{book.title_en}</p>
        )}
        {book.publication_year && (
          <p className="mt-2 text-xs uppercase tracking-widest text-neutral-400">
            {book.publication_year}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
      <p className="font-serif text-lg">कोई पुस्तक उपलब्ध नहीं है</p>
      <p className="mt-1 text-sm">No books available yet.</p>
    </div>
  );
}