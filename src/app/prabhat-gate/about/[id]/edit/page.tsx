import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAboutSectionForAdmin } from '@/lib/about';
import { updateAboutSection } from '@/lib/actions/about';
import { Container } from '@/components/ui/container';
import { SectionForm } from '../../section-form';

export const metadata = { title: 'Edit Section', robots: { index: false, follow: false } };

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

export default async function EditSectionPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const section = await getAboutSectionForAdmin(id);
  if (!section) notFound();

  const boundUpdate = updateAboutSection.bind(null, id);

  return (
    <Container>
      <div className="py-10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
        <h1 className="mt-1 font-serif text-3xl text-neutral-900">{section.title_hi}</h1>
        <div className="mt-8 max-w-3xl">
          <SectionForm section={section} action={boundUpdate} />
        </div>
      </div>
    </Container>
  );
}
