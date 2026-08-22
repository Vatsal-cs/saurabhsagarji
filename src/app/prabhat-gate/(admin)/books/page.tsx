import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAllBooksForAdmin } from '@/lib/books';
import { Container } from '@/components/ui/container';
import { BookRowActions } from './book-row-actions';
import { BookReorderModal } from './book-reorder-modal';

export const metadata = {
  title: 'Manage Books',
  robots: { index: false, follow: false },
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/prabhat-gate/login');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .single();

  if (!admin || !admin.is_active) redirect('/prabhat-gate/login');
  return admin;
}

export default async function AdminBooksPage() {
  await requireAdmin();
  const books = await getAllBooksForAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
            <h1 className="mt-1 font-serif text-3xl text-neutral-900">Books</h1>
          </div>
          <div className="flex items-center gap-3">
            {books.length > 1 && <BookReorderModal books={books} />}
            <Link
              href="/prabhat-gate/books/new"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
            >
              + New book
            </Link>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            No books yet. Click &ldquo;New book&rdquo; to add the first one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="font-serif text-base text-neutral-900">{book.title_hi}</div>
                      {book.title_en && (
                        <div className="text-xs text-neutral-500">{book.title_en}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{book.slug}</td>
                    <td className="px-4 py-3 text-neutral-700">{book.publication_year ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <StatusPill isPublished={book.is_published} />
                        {book.is_home_pinned && <PinnedPill />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {new Date(book.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <BookRowActions id={book.id} titleHi={book.title_hi} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}

function PinnedPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-medium text-gold-600">
      Pinned
    </span>
  );
}

function StatusPill({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
      Draft
    </span>
  );
}
