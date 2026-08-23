import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSiteLaunched } from '@/lib/site-content';
import { LaunchButton } from './launch-button';
import { TestRevealButton } from './test-reveal-button';

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

  const launched = await isSiteLaunched();

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

        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="font-serif text-lg text-neutral-900">
            {launched ? 'Site status' : 'Ready to launch?'}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {launched
              ? 'Visitors see the real site.'
              : 'Everyone currently sees a "Coming Soon" page. Pressing Launch makes the real site public for everyone — this can’t be undone.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <LaunchButton launched={launched} />
            <TestRevealButton />
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            &ldquo;Test reveal&rdquo; previews the curtain + sound as many times as you want — it never touches the
            launch flag. Needs preview access unlocked in this browser first (visit /api/preview?token=...
            once).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
            <AdminNavCard href="/prabhat-gate/books" title="Books" description="Manage published books." />
            <AdminNavCard href="/prabhat-gate/bhajans" title="Bhajans" description="Manage bhajan videos." />
            <AdminNavCard href="/prabhat-gate/events" title="Events" description="Manage upcoming and past events." />
            <AdminNavCard href="/prabhat-gate/gallery" title="Gallery" description="Manage photo albums." />
            <AdminNavCard href="/prabhat-gate/about" title="About" description="Manage about sections." />
            <AdminNavCard href="#" title="Site content" description="Coming soon." disabled />
        </div>
      </div>
    </div>
  );

}
function AdminNavCard({
    href,
    title,
    description,
    disabled,
  }: {
    href: string;
    title: string;
    description: string;
    disabled?: boolean;
  }) {
    const className =
      'block rounded-lg border p-6 transition-colors ' +
      (disabled
        ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400'
        : 'border-neutral-200 bg-white text-neutral-900 hover:border-saffron-400');
  
    const content = (
      <>
        <div className="font-serif text-lg">{title}</div>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </>
    );
  
    if (disabled) {
      return <div className={className}>{content}</div>;
    }
  
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  