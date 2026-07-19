import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type PublicTeaching = {
  id: string;
  youtube_video_id: string;
  pravachan_date: string | null;
  display_order: number;
};

function toPublic(row: Database['public']['Tables']['teachings']['Row']): PublicTeaching {
  return {
    id: row.id,
    youtube_video_id: row.youtube_video_id,
    pravachan_date: row.pravachan_date,
    display_order: row.display_order,
  };
}

export async function getPublishedTeachings(): Promise<PublicTeaching[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teachings')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPublishedTeachings]', error);
    return [];
  }
  return (data ?? []).map(toPublic);
}

export async function getAllTeachingsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teachings')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getAllTeachingsForAdmin]', error);
    return [];
  }
  return data ?? [];
}
