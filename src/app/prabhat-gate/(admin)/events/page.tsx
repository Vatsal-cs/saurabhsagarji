import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAllEventsForAdmin } from '@/lib/events';
import { Container } from '@/components/ui/container';
import { EventRowActions } from './event-row-actions';

export const metadata = {
  title: 'Manage Events',
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

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await getAllEventsForAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
            <h1 className="mt-1 font-serif text-3xl text-neutral-900">Events</h1>
          </div>
          <Link
            href="/prabhat-gate/events/new"
            className="rounded-full bg-crimson-800 px-5 py-2.5 text-sm text-white transition-colors hover:bg-crimson-900"
          >
            + New event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            No events yet. Click "New event" to add the first one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.cover_image_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 text-neutral-300">
                            ▢
                          </div>
                        )}
                        <div>
                          <div className="font-serif text-base text-neutral-900">{event.title_hi}</div>
                          {event.venue_name && (
                            <div className="text-xs text-neutral-500">{event.venue_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {new Date(event.start_datetime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill isPublished={event.is_published} />
                    </td>
                    <td className="px-4 py-3">
                      <EventRowActions id={event.id} isPublished={event.is_published} />
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
