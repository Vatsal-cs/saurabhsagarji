'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { albumInputSchema, type AlbumInput } from '@/lib/schemas/gallery';

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .single();

  if (!admin || !admin.is_active) throw new Error('Not authorized');
  return { supabase, adminId: admin.id };
}

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof AlbumInput, string>>;
    };

function toFieldErrors(err: import('zod').ZodError<AlbumInput>) {
  const map: Partial<Record<keyof AlbumInput, string>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof AlbumInput;
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function formDataToAlbumInput(formData: FormData): unknown {
  return {
    slug: formData.get('slug'),
    title_hi: formData.get('title_hi'),
    title_en: formData.get('title_en'),
    description_hi: formData.get('description_hi'),
    description_en: formData.get('description_en'),
    album_date: formData.get('album_date'),
    is_published: formData.get('is_published') === 'on',
  };
}

async function uploadCoverImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string
): Promise<string> {
  if (file.size > 50 * 1024 * 1024) throw new Error('Cover image must be under 50 MB');
  if (!file.type.startsWith('image/')) throw new Error('Cover must be an image file');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `album-cover-${slug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('gallery-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from('gallery-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function createAlbum(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const parsed = albumInputSchema.safeParse(formDataToAlbumInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;
  let coverUrl: string | null = null;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCoverImage(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      album_date: values.album_date ?? null,
      is_published: values.is_published,
      published_at: values.is_published ? new Date().toISOString() : null,
      created_by: adminId,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'An album with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/prabhat-gate/gallery');
  redirect(`/prabhat-gate/gallery/${data.id}/edit`);
}

export async function updateAlbum(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();

  const parsed = albumInputSchema.safeParse(formDataToAlbumInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;

  const { data: existing } = await supabase
    .from('gallery_albums')
    .select('is_published, published_at, slug, cover_image_url')
    .eq('id', id)
    .single();

  if (!existing) return { ok: false, error: 'Album not found.' };

  let coverUrl = existing.cover_image_url;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCoverImage(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  const nowPublishing = values.is_published && !existing.is_published;

  const { error } = await supabase
    .from('gallery_albums')
    .update({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      album_date: values.album_date ?? null,
      is_published: values.is_published,
      published_at: nowPublishing ? new Date().toISOString() : existing.published_at,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'An album with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/prabhat-gate/gallery');

  return { ok: true };
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/gallery');
  revalidatePath('/prabhat-gate/gallery');
  redirect('/prabhat-gate/gallery');
}

export async function toggleAlbumPublished(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase
    .from('gallery_albums')
    .select('is_published, published_at')
    .eq('id', id)
    .single();
  if (!existing) return { ok: false, error: 'Album not found.' };
  const newPublished = !existing.is_published;
  const { error } = await supabase
    .from('gallery_albums')
    .update({
      is_published: newPublished,
      published_at: newPublished && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/gallery');
  revalidatePath('/prabhat-gate/gallery');
  return { ok: true };
}

/**
 * Bulk photo upload. Accepts multiple files from the form and inserts
 * one gallery_photos row per file, auto-incrementing display_order
 * after whatever photos already exist in the album.
 */
export async function uploadPhotos(
  albumId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const files = formData.getAll('photos') as File[];
  const realFiles = files.filter((f) => f && f.size > 0);

  if (realFiles.length === 0) {
    return { ok: false, error: 'Please choose at least one photo.' };
  }

  const { data: existingPhotos } = await supabase
    .from('gallery_photos')
    .select('display_order')
    .eq('album_id', albumId)
    .order('display_order', { ascending: false })
    .limit(1);

  let nextOrder = (existingPhotos?.[0]?.display_order ?? -1) + 1;

  const errors: string[] = [];

  for (const file of realFiles) {
    if (file.size > 50 * 1024 * 1024) {
      errors.push(`${file.name}: over 50 MB, skipped`);
      continue;
    }
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name}: not an image, skipped`);
      continue;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${albumId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage.from('gallery-photos').getPublicUrl(path);

    const { error: insertError } = await supabase.from('gallery_photos').insert({
      album_id: albumId,
      image_url: urlData.publicUrl,
      display_order: nextOrder,
      created_by: adminId,
    });

    if (insertError) {
      errors.push(`${file.name}: ${insertError.message}`);
      continue;
    }

    nextOrder += 1;
  }

  revalidatePath('/gallery');
  revalidatePath(`/prabhat-gate/gallery/${albumId}/edit`);

  if (errors.length > 0 && errors.length === realFiles.length) {
    return { ok: false, error: `All uploads failed: ${errors.join('; ')}` };
  }
  if (errors.length > 0) {
    return { ok: false, error: `Some uploads had issues: ${errors.join('; ')}` };
  }

  return { ok: true };
}

export async function deletePhoto(photoId: string, albumId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('image_url')
    .eq('id', photoId)
    .single();

  const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId);
  if (error) return { ok: false, error: error.message };

  if (photo?.image_url) {
    const path = photo.image_url.split('/gallery-photos/')[1];
    if (path) {
      await supabase.storage.from('gallery-photos').remove([path]);
    }
  }

  revalidatePath('/gallery');
  revalidatePath(`/prabhat-gate/gallery/${albumId}/edit`);
  return { ok: true };
}
