'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { eventInputSchema, type EventInput } from '@/lib/schemas/event';
import { extractYouTubeId } from '@/lib/youtube';
import { resizeForUpload } from '@/lib/image-resize';

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
      fieldErrors?: Partial<Record<keyof EventInput, string>>;
    };

function toFieldErrors(err: import('zod').ZodError<EventInput>) {
  const map: Partial<Record<keyof EventInput, string>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof EventInput;
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function formDataToInput(formData: FormData): unknown {
  return {
    slug: formData.get('slug'),
    title_hi: formData.get('title_hi'),
    title_en: formData.get('title_en'),
    description_hi: formData.get('description_hi'),
    description_en: formData.get('description_en'),
    venue_name: formData.get('venue_name'),
    venue_address: formData.get('venue_address'),
    venue_map_url: formData.get('venue_map_url'),
    start_datetime: formData.get('start_datetime'),
    end_datetime: formData.get('end_datetime'),
    youtube_url: formData.get('youtube_url'),
    is_published: formData.get('is_published') === 'on',
  };
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string
): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Cover image must be under 10 MB');
  if (!file.type.startsWith('image/')) throw new Error('Cover must be an image file');

  const resized = await resizeForUpload(file);
  const path = `${slug}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('event-covers')
    .upload(path, resized, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from('event-covers').getPublicUrl(path);
  return data.publicUrl;
}

export async function createEvent(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const parsed = eventInputSchema.safeParse(formDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;
  let coverUrl: string | null = null;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCover(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  const videoId = values.youtube_url ? extractYouTubeId(values.youtube_url) : null;

  const { data, error } = await supabase
    .from('events')
    .insert({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      venue_name: values.venue_name ?? null,
      venue_address: values.venue_address ?? null,
      venue_map_url: values.venue_map_url ?? null,
      start_datetime: new Date(values.start_datetime).toISOString(),
      end_datetime: values.end_datetime ? new Date(values.end_datetime).toISOString() : null,
      youtube_url: values.youtube_url ?? null,
      youtube_video_id: videoId,
      is_published: values.is_published,
      published_at: values.is_published ? new Date().toISOString() : null,
      created_by: adminId,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'An event with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/prabhat-gate/events');
  redirect(`/prabhat-gate/events/${data.id}/edit`);
}

export async function updateEvent(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();

  const parsed = eventInputSchema.safeParse(formDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;

  const { data: existing } = await supabase
    .from('events')
    .select('is_published, published_at, slug, cover_image_url')
    .eq('id', id)
    .single();

  if (!existing) return { ok: false, error: 'Event not found.' };

  let coverUrl = existing.cover_image_url;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCover(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  const videoId = values.youtube_url ? extractYouTubeId(values.youtube_url) : null;
  const nowPublishing = values.is_published && !existing.is_published;

  const { error } = await supabase
    .from('events')
    .update({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      venue_name: values.venue_name ?? null,
      venue_address: values.venue_address ?? null,
      venue_map_url: values.venue_map_url ?? null,
      start_datetime: new Date(values.start_datetime).toISOString(),
      end_datetime: values.end_datetime ? new Date(values.end_datetime).toISOString() : null,
      youtube_url: values.youtube_url ?? null,
      youtube_video_id: videoId,
      is_published: values.is_published,
      published_at: nowPublishing ? new Date().toISOString() : existing.published_at,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'An event with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/prabhat-gate/events');

  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/events');
  revalidatePath('/prabhat-gate/events');
  redirect('/prabhat-gate/events');
}

export async function toggleEventPublished(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase
    .from('events')
    .select('is_published, published_at')
    .eq('id', id)
    .single();
  if (!existing) return { ok: false, error: 'Event not found.' };
  const newPublished = !existing.is_published;
  const { error } = await supabase
    .from('events')
    .update({
      is_published: newPublished,
      published_at: newPublished && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/events');
  revalidatePath('/prabhat-gate/events');
  return { ok: true };
}
