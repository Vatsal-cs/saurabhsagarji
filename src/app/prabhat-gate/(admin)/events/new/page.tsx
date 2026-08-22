import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createEvent } from '@/lib/actions/events';
import { Container } from '@/components/ui/container';
import { EventForm } from '../event-form';

export const metadata = { title: 'New Event', robots: { index: false, follow: false } };

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
}

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <Container>
      <div className="py-10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
        <h1 className="mt-1 font-serif text-3xl text-neutral-900">New event</h1>
        <div className="mt-8 max-w-3xl">
          <EventForm action={createEvent} />
        </div>
      </div>
    </Container>
  );
}
