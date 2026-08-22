const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts an 11-character YouTube video ID from any common URL format:
 * - https://www.youtube.com/watch?v=VIDEOID (v= anywhere in the query
 *   string, not just first — e.g. copied from inside a playlist)
 * - https://youtu.be/VIDEOID
 * - https://www.youtube.com/shorts/VIDEOID
 * - https://www.youtube.com/live/VIDEOID (livestreams/premieres)
 * - https://www.youtube.com/embed/VIDEOID
 * - any youtube.com subdomain (www., m., music., or none)
 * Returns null if no valid ID could be extracted.
 */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.replace(/^(www|m|music)\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (YOUTUBE_ID_RE.test(id)) return id;
    }

    if (host === 'youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v && YOUTUBE_ID_RE.test(v)) return v;

      const pathMatch = parsed.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) return pathMatch[1];
    }
  } catch {
    // Fall through — some pasted values (a bare ID, a malformed URL) won't
    // parse as a URL at all, so fall back to a loose scan below instead of
    // failing outright.
  }

  const fallback = trimmed.match(/(?:[?&]v=|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return fallback ? fallback[1] : null;
}

// --- Channel data (Teachings/Pravachan page's "live" preview) ------------

import { YOUTUBE_HANDLE } from '@/lib/social-links';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

type YoutubeThumbnails = {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
};

type ChannelsListResponse = {
  items?: Array<{
    id: string;
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>;
};

type PlaylistItemsListResponse = {
  items?: Array<{
    snippet?: {
      title: string;
      publishedAt: string;
      thumbnails?: YoutubeThumbnails;
      resourceId?: { videoId?: string };
    };
  }>;
};

type VideosListResponse = {
  items?: Array<{
    id: string;
    snippet?: { title: string; liveBroadcastContent?: string; thumbnails?: YoutubeThumbnails };
  }>;
};

/**
 * Resolves the channel's numeric ID and uploads-playlist ID from its
 * @handle. Cached for a full day — this pairing never changes in practice,
 * and it lets every other call below avoid a second handle lookup.
 */
async function getChannelInfo(): Promise<{ channelId: string; uploadsPlaylistId: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${YOUTUBE_API_BASE}/channels?part=contentDetails&forHandle=${encodeURIComponent(YOUTUBE_HANDLE)}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = (await res.json()) as ChannelsListResponse;
    const item = data.items?.[0];
    const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
    if (!item || !uploadsPlaylistId) return null;

    return { channelId: item.id, uploadsPlaylistId };
  } catch (error) {
    console.error('[getChannelInfo]', error);
    return null;
  }
}

export type ChannelVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
};

/**
 * Latest uploads from the channel, via the cheap uploads-playlist endpoint
 * (1 quota unit) rather than search.list (100 units). Returns [] on any
 * failure — missing/invalid API key, quota exceeded, network error — so the
 * Teachings page can always fall back to a "visit the channel" CTA instead
 * of breaking.
 */
export async function getLatestChannelVideos(limit = 8): Promise<ChannelVideo[]> {
  if (!process.env.YOUTUBE_API_KEY) return [];
  const channel = await getChannelInfo();
  if (!channel) return [];

  try {
    const url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&maxResults=${limit}&playlistId=${channel.uploadsPlaylistId}&key=${process.env.YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = (await res.json()) as PlaylistItemsListResponse;
    const videos: ChannelVideo[] = [];
    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      const thumbnailUrl = item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url;
      if (!videoId || !thumbnailUrl || !item.snippet) continue;
      videos.push({
        id: videoId,
        title: item.snippet.title,
        thumbnailUrl,
        publishedAt: item.snippet.publishedAt,
      });
    }
    return videos;
  } catch (error) {
    console.error('[getLatestChannelVideos]', error);
    return [];
  }
}

export type LiveVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
};

/**
 * Currently-live broadcast on the channel, if any.
 *
 * Deliberately doesn't use search.list's `eventType=live` filter — that
 * endpoint is well known to lag or simply miss channels that are actively
 * live (confirmed directly against this channel: it returned zero results
 * 41 minutes into a live stream with viewers watching). Instead this checks
 * the same handful of most-recent uploads already fetched elsewhere, via
 * videos.list's `liveBroadcastContent` field, which YouTube keeps accurate
 * in real time. Bonus: videos.list is 1 quota unit vs. search.list's 100.
 * Returns null (nothing rendered) whenever nothing is live or the lookup
 * fails — never a false "live" state.
 */
export async function getLiveChannelVideo(): Promise<LiveVideo | null> {
  if (!process.env.YOUTUBE_API_KEY) return null;
  const channel = await getChannelInfo();
  if (!channel) return null;

  try {
    const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&maxResults=5&playlistId=${channel.uploadsPlaylistId}&key=${process.env.YOUTUBE_API_KEY}`;
    const playlistRes = await fetch(playlistUrl, { next: { revalidate: 120 } });
    if (!playlistRes.ok) return null;

    const playlistData = (await playlistRes.json()) as PlaylistItemsListResponse;
    const ids = (playlistData.items ?? [])
      .map((item) => item.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) return null;

    const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet&id=${ids.join(',')}&key=${process.env.YOUTUBE_API_KEY}`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 120 } });
    if (!videosRes.ok) return null;

    const videosData = (await videosRes.json()) as VideosListResponse;
    const liveItem = videosData.items?.find((item) => item.snippet?.liveBroadcastContent === 'live');
    const thumbnailUrl = liveItem?.snippet?.thumbnails?.medium?.url ?? liveItem?.snippet?.thumbnails?.default?.url;
    if (!liveItem || !thumbnailUrl || !liveItem.snippet?.title) return null;

    return { id: liveItem.id, title: liveItem.snippet.title, thumbnailUrl };
  } catch (error) {
    console.error('[getLiveChannelVideo]', error);
    return null;
  }
}
