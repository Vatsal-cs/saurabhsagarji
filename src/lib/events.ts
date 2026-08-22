import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];

export type PublicEvent = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_map_url: string | null;
  start_datetime: string;
  end_datetime: string | null;
  youtube_video_id: string | null;
};

function toPublic(row: Event): PublicEvent {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    description_hi: row.description_hi,
    description_en: row.description_en,
    cover_image_url: row.cover_image_url,
    venue_name: row.venue_name,
    venue_address: row.venue_address,
    venue_map_url: row.venue_map_url,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    youtube_video_id: row.youtube_video_id,
  };
}

/**
 * The single soonest upcoming published event (start OR end date in the
 * future), or null if there isn't one. Used for the featured card.
 *
 * Cached and cookie-free (see getPublishedBhajans for why) — a 60s window on
 * an event's upcoming/past boundary is invisible in practice.
 */
export const getUpcomingEvent = unstable_cache(
  async (): Promise<PublicEvent | null> => {
    const supabase = createStaticClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .or(`end_datetime.gte.${nowIso},and(end_datetime.is.null,start_datetime.gte.${nowIso})`)
      .order('start_datetime', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[getUpcomingEvent]', error);
      return null;
    }
    return data ? toPublic(data) : null;
  },
  ['getUpcomingEvent'],
  { revalidate: 60 }
);

/**
 * Published events that have already happened, newest first.
 * Excludes whatever getUpcomingEvent() would return.
 */
export const getPastEvents = unstable_cache(
  async (): Promise<PublicEvent[]> => {
    const supabase = createStaticClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .or(`end_datetime.lt.${nowIso},and(end_datetime.is.null,start_datetime.lt.${nowIso})`)
      .order('start_datetime', { ascending: false });

    if (error) {
      console.error('[getPastEvents]', error);
      return [];
    }
    return (data ?? []).map(toPublic);
  },
  ['getPastEvents'],
  { revalidate: 60 }
);

export async function getAllEventsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_datetime', { ascending: false });

  if (error) {
    console.error('[getAllEventsForAdmin]', error);
    return [];
  }
  return data ?? [];
}

export async function getEventForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getEventForAdmin]', error);
    return null;
  }
  return data;
}
