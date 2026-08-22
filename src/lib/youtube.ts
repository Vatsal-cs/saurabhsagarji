/**
 * Extracts an 11-character YouTube video ID from any common URL format:
 * - https://www.youtube.com/watch?v=VIDEOID
 * - https://youtu.be/VIDEOID
 * - https://www.youtube.com/shorts/VIDEOID
 * - https://m.youtube.com/watch?v=VIDEOID
 * - https://www.youtube.com/embed/VIDEOID
 * Returns null if no valid ID could be extracted.
 */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
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

type SearchListResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: { title: string; thumbnails?: YoutubeThumbnails };
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
 * Currently-live broadcast on the channel, if any. Uses search.list (100
 * quota units) since that's the only endpoint that can filter by live
 * status, so it's cached longer than a normal request but shorter than the
 * uploads list, to keep "Live Now" reasonably fresh without burning quota.
 * Returns null (nothing rendered) whenever nothing is live or the lookup
 * fails — never a false "live" state.
 */
export async function getLiveChannelVideo(): Promise<LiveVideo | null> {
  if (!process.env.YOUTUBE_API_KEY) return null;
  const channel = await getChannelInfo();
  if (!channel) return null;

  try {
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&eventType=live&channelId=${channel.channelId}&key=${process.env.YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data = (await res.json()) as SearchListResponse;
    const item = data.items?.[0];
    const videoId = item?.id?.videoId;
    const thumbnailUrl = item?.snippet?.thumbnails?.medium?.url ?? item?.snippet?.thumbnails?.default?.url;
    if (!videoId || !thumbnailUrl || !item?.snippet) return null;

    return { id: videoId, title: item.snippet.title, thumbnailUrl };
  } catch (error) {
    console.error('[getLiveChannelVideo]', error);
    return null;
  }
}
