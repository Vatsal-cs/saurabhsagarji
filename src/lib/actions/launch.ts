'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * One-way switch: flips the public site from the "Coming Soon" splash to
 * the real site for every visitor, permanently. There's no "unlaunch" —
 * once the client presses this, it stays live.
 */
export async function launchSite(): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const { error } = await supabase.from('site_content').upsert({
    key: 'site_launched',
    value_hi: 'true',
    value_en: 'true',
    updated_by: adminId,
  });

  if (error) return { ok: false, error: error.message };

  // The public read is cached (see lib/site-content.ts) — updateTag clears
  // every cached copy immediately (read-your-own-writes, since this runs
  // inside a Server Action) instead of waiting out the normal 60s window,
  // so the switch takes effect the moment this resolves.
  updateTag('site-content');
  revalidatePath('/', 'layout');

  return { ok: true };
}
