'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { aboutSectionInputSchema, type AboutSectionInput } from '@/lib/schemas/about';

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
      fieldErrors?: Partial<Record<keyof AboutSectionInput, string>>;
    };

function toFieldErrors(err: import('zod').ZodError<AboutSectionInput>) {
  const map: Partial<Record<keyof AboutSectionInput, string>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof AboutSectionInput;
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function formDataToInput(formData: FormData): unknown {
  const orderRaw = formData.get('display_order');
  return {
    slug: formData.get('slug'),
    title_hi: formData.get('title_hi'),
    title_en: formData.get('title_en'),
    intro_hi: formData.get('intro_hi'),
    intro_en: formData.get('intro_en'),
    body_hi: formData.get('body_hi'),
    body_en: formData.get('body_en'),
    display_order: orderRaw && String(orderRaw).trim() !== '' ? Number(orderRaw) : 0,
    is_published: formData.get('is_published') === 'on',
  };
}

async function uploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string,
  slot: 1 | 2
): Promise<string> {
  if (file.size > 15 * 1024 * 1024) throw new Error('Photo must be under 15 MB');
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${slug}-photo${slot}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('about-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from('about-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function updateAboutSection(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();

  const parsed = aboutSectionInputSchema.safeParse(formDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;

  const { data: existing } = await supabase
    .from('about_sections')
    .select('is_published, published_at, slug, photo_1_url, photo_2_url')
    .eq('id', id)
    .single();

  if (!existing) return { ok: false, error: 'Section not found.' };

  let photo1Url = existing.photo_1_url;
  let photo2Url = existing.photo_2_url;

  try {
    const photo1File = formData.get('photo_1_file') as File | null;
    if (photo1File && photo1File.size > 0) {
      photo1Url = await uploadPhoto(supabase, photo1File, values.slug, 1);
    }
    const photo2File = formData.get('photo_2_file') as File | null;
    if (photo2File && photo2File.size > 0) {
      photo2Url = await uploadPhoto(supabase, photo2File, values.slug, 2);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  const nowPublishing = values.is_published && !existing.is_published;

  const { error } = await supabase
    .from('about_sections')
    .update({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      intro_hi: values.intro_hi ?? null,
      intro_en: values.intro_en ?? null,
      body_hi: values.body_hi ?? null,
      body_en: values.body_en ?? null,
      photo_1_url: photo1Url,
      photo_2_url: photo2Url,
      display_order: values.display_order,
      is_published: values.is_published,
      published_at: nowPublishing ? new Date().toISOString() : existing.published_at,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A section with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/about');
  revalidatePath(`/about/${existing.slug}`);
  if (existing.slug !== values.slug) revalidatePath(`/about/${values.slug}`);
  revalidatePath('/prabhat-gate/about');

  return { ok: true };
}

export async function toggleAboutSectionPublished(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase
    .from('about_sections')
    .select('is_published, published_at, slug')
    .eq('id', id)
    .single();
  if (!existing) return { ok: false, error: 'Section not found.' };
  const newPublished = !existing.is_published;
  const { error } = await supabase
    .from('about_sections')
    .update({
      is_published: newPublished,
      published_at: newPublished && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/about');
  revalidatePath(`/about/${existing.slug}`);
  revalidatePath('/prabhat-gate/about');
  return { ok: true };
}
