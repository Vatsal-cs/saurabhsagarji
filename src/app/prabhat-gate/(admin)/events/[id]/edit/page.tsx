import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEventForAdmin } from '@/lib/events';
import { updateEvent } from '@/lib/actions/events';
import { Container } from '@/components/ui/container';
import { EventForm } from '../../event-form';

export const metadata = { title: 'Edit Event', robots: { index: false, follow: false } };

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

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const event = await getEventForAdmin(id);
  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, id);

  return (
    <Container>
      <div className="py-10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
        <h1 className="mt-1 font-serif text-3xl text-neutral-900">{event.title_hi}</h1>
        <div className="mt-8 max-w-3xl">
          <EventForm event={event} action={boundUpdate} />
        </div>
      </div>
    </Container>
  );
}
