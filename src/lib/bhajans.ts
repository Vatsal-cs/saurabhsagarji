import { createClient } from '@/lib/supabase/server';
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

/** All published bhajans, in display order — for the public grid. */
export async function getPublishedBhajans(): Promise<PublicBhajan[]> {
  const supabase = await createClient();
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
}

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
