import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/prabhat-gate/login');
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!adminRow || !adminRow.is_active) {
    redirect('/prabhat-gate/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-neutral-900">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Signed in as {adminRow.full_name ?? adminRow.email}
            </p>
          </div>
          <form action="/prabhat-gate/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-neutral-600">
            Content management interface coming soon. This will be where you create and edit
            bhajans, teachings, books, events, and site content.
          </p>
        </div>
      </div>
    </div>
  );
}