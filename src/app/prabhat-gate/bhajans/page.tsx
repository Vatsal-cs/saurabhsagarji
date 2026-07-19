import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllBhajansForAdmin } from '@/lib/bhajans';
import { addBhajan } from '@/lib/actions/bhajans';
import { Container } from '@/components/ui/container';
import { BhajanForm } from './bhajan-form';
import { BhajanRow } from './bhajan-row';

export const metadata = {
  title: 'Manage Bhajans',
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

export default async function AdminBhajansPage() {
  await requireAdmin();
  const bhajans = await getAllBhajansForAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-900">Bhajans</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Paste a YouTube link below. No title or description needed — the video plays directly on the public page.
          </p>
        </div>

        <div className="mb-10 max-w-xl">
          <BhajanForm action={addBhajan} />
        </div>

        {bhajans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            No bhajans yet. Paste a YouTube link above to add the first one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bhajans.map((bhajan) => (
              <BhajanRow key={bhajan.id} bhajan={bhajan} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
