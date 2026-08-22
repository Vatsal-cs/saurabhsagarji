import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/types/database';

export type PublicBhajan = {
  id: string;
  youtube_video_id: string;
  display_order: number;
};

function toPublic(row: Database['public']['Tables']['bhajans']['Row']): PublicBhajan {
  return {
    id: row.id,
    youtube_video_id: row.youtube_video_id,
    display_order: row.display_order,
  };
}

/**
 * All published bhajans, in display order — for the public grid.
 * Cached and cookie-free — the cookie-bound client forced this (and every
 * other public read) into fully dynamic per-request SSR for no reason, since
 * this data doesn't depend on the visitor at all. Admin publish/edit actions
 * call revalidatePath('/bhajans'), so edits still show up immediately; this
 * revalidate window is just the ceiling for how stale a *repeat* request can
 * be between those.
 */
export const getPublishedBhajans = unstable_cache(
  async (): Promise<PublicBhajan[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('bhajans')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getPublishedBhajans]', error);
      return [];
    }
    return (data ?? []).map(toPublic);
  },
  ['getPublishedBhajans'],
  { revalidate: 60 }
);

/** Admin: every bhajan regardless of publish state. */
export async function getAllBhajansForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bhajans')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getAllBhajansForAdmin]', error);
    return [];
  }
  return data ?? [];
}
