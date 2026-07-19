import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAlbumForAdmin, getPhotosForAlbumAdmin } from '@/lib/gallery';
import { updateAlbum } from '@/lib/actions/gallery';
import { Container } from '@/components/ui/container';
import { AlbumForm } from '../../album-form';
import { PhotoManager } from './photo-manager';

export const metadata = { title: 'Edit Album', robots: { index: false, follow: false } };

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

export default async function EditAlbumPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const album = await getAlbumForAdmin(id);
  if (!album) notFound();

  const photos = await getPhotosForAlbumAdmin(id);
  const boundUpdate = updateAlbum.bind(null, id);

  return (
    <Container>
      <div className="py-10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Admin</p>
        <h1 className="mt-1 font-serif text-3xl text-neutral-900">{album.title_hi}</h1>

        <div className="mt-8 max-w-3xl">
          <AlbumForm album={album} action={boundUpdate} />
        </div>

        <div className="mt-14 max-w-3xl border-t border-neutral-200 pt-10">
          <h2 className="font-serif text-2xl text-crimson-800">Photos</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {photos.length} photo{photos.length === 1 ? '' : 's'} in this album.
          </p>
          <div className="mt-6">
            <PhotoManager albumId={id} photos={photos} />
          </div>
        </div>
      </div>
    </Container>
  );
}
