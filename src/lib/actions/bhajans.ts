'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { bhajanInputSchema, type BhajanInput } from '@/lib/schemas/bhajan';
import { extractYouTubeId } from '@/lib/youtube';

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
      fieldErrors?: Partial<Record<keyof BhajanInput, string>>;
    };

function toFieldErrors(err: import('zod').ZodError<BhajanInput>) {
  const map: Partial<Record<keyof BhajanInput, string>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof BhajanInput;
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

export async function addBhajan(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const parsed = bhajanInputSchema.safeParse({
    youtube_url: formData.get('youtube_url'),
    is_published: formData.get('is_published') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;
  const videoId = extractYouTubeId(values.youtube_url);
  if (!videoId) {
    return { ok: false, error: 'Could not extract a video ID from that link.' };
  }

  const { data: existing } = await supabase
    .from('bhajans')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;

  const { error } = await supabase.from('bhajans').insert({
    youtube_url: values.youtube_url,
    youtube_video_id: videoId,
    display_order: nextOrder,
    is_published: values.is_published,
    published_at: values.is_published ? new Date().toISOString() : null,
    created_by: adminId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/bhajans');
  revalidatePath('/prabhat-gate/bhajans');

  return { ok: true };
}

export async function deleteBhajan(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from('bhajans').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/bhajans');
  revalidatePath('/prabhat-gate/bhajans');
  return { ok: true };
}

export async function toggleBhajanPublished(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase
    .from('bhajans')
    .select('is_published, published_at')
    .eq('id', id)
    .single();
  if (!existing) return { ok: false, error: 'Bhajan not found.' };
  const newPublished = !existing.is_published;
  const { error } = await supabase
    .from('bhajans')
    .update({
      is_published: newPublished,
      published_at: newPublished && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/bhajans');
  revalidatePath('/prabhat-gate/bhajans');
  return { ok: true };
}
