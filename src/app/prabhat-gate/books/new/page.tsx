import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { BookForm } from '../book-form';
import { createBook } from '@/lib/actions/books';

export const metadata = {
  title: 'New book',
  robots: { index: false, follow: false },
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/prabhat-gate/login');
  const { data: admin } = await supabase.from('admin_users').select('is_active').eq('id', user.id).single();
  if (!admin || !admin.is_active) redirect('/prabhat-gate/login');
}

export default async function NewBookPage() {
  await requireAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-900">New book</h1>
        </div>
        <BookForm action={createBook} />
      </div>
    </Container>
  );
}