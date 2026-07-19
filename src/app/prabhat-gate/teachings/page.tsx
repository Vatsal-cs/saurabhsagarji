import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllTeachingsForAdmin } from '@/lib/teachings';
import { addTeaching } from '@/lib/actions/teachings';
import { Container } from '@/components/ui/container';
import { TeachingForm } from './teaching-form';
import { TeachingRow } from './teaching-row';

export const metadata = {
  title: 'Manage Teachings',
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

export default async function AdminTeachingsPage() {
  await requireAdmin();
  const teachings = await getAllTeachingsForAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-900">Teachings</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Paste a YouTube link, optionally add the pravachan date.
          </p>
        </div>

        <div className="mb-10 max-w-xl">
          <TeachingForm action={addTeaching} />
        </div>

        {teachings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            No teachings yet. Paste a YouTube link above to add the first one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachings.map((teaching) => (
              <TeachingRow key={teaching.id} teaching={teaching} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
