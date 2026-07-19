import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllAboutSectionsForAdmin } from '@/lib/about';
import { Container } from '@/components/ui/container';
import { SectionRowActions } from './section-row-actions';

export const metadata = {
  title: 'Manage About Sections',
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

export default async function AdminAboutPage() {
  await requireAdmin();
  const sections = await getAllAboutSectionsForAdmin();

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-900">About Sections</h1>
          <p className="mt-2 text-sm text-neutral-500">
            These 6 sections are fixed — edit their content and photos below.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sections.map((section) => (
                <tr key={section.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {section.photo_1_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={section.photo_1_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 text-neutral-300">
                          ▢
                        </div>
                      )}
                      <div>
                        <div className="font-serif text-base text-neutral-900">{section.title_hi}</div>
                        {section.title_en && (
                          <div className="text-xs text-neutral-500">{section.title_en}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{section.slug}</td>
                  <td className="px-4 py-3">
                    <StatusPill isPublished={section.is_published} />
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(section.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <SectionRowActions id={section.id} isPublished={section.is_published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
