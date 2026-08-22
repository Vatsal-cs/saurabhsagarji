import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { getVideoPublishDates } from '@/lib/youtube';
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
 * All published bhajans, newest-on-YouTube first — for the public grid.
 * Sorted by each video's actual YouTube publish date rather than
 * display_order (an admin-set field for the *order added to the site*,
 * which isn't the same thing and drifts from it whenever bhajans get added
 * out of upload order). display_order is still the tiebreaker for any video
 * whose YouTube date lookup fails (no API key, deleted video, etc.), so
 * ordering never breaks even without live YouTube data.
 *
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
      .eq('is_published', true);

    if (error) {
      console.error('[getPublishedBhajans]', error);
      return [];
    }
    const bhajans = (data ?? []).map(toPublic);

    const publishDates = await getVideoPublishDates(bhajans.map((b) => b.youtube_video_id));
    return bhajans.sort((a, b) => {
      const dateA = publishDates[a.youtube_video_id];
      const dateB = publishDates[b.youtube_video_id];
      if (dateA && dateB) return new Date(dateB).getTime() - new Date(dateA).getTime();
      if (dateA) return -1;
      if (dateB) return 1;
      return a.display_order - b.display_order;
    });
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
