import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { BookForm } from '../../book-form';
import { getBookByIdForAdmin } from '@/lib/books';
import { updateBook } from '@/lib/actions/books';

export const metadata = {
  title: 'Edit book',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/prabhat-gate/login');
  const { data: admin } = await supabase.from('admin_users').select('is_active').eq('id', user.id).single();
  if (!admin || !admin.is_active) redirect('/prabhat-gate/login');
}

export default async function EditBookPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const book = await getBookByIdForAdmin(id);
  if (!book) notFound();

  const boundUpdate = updateBook.bind(null, id);

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-900">Edit book</h1>
          <p className="mt-1 text-sm text-neutral-500">{book.title_hi}</p>
        </div>
        <BookForm book={book} action={boundUpdate} />
      </div>
    </Container>
  );
}