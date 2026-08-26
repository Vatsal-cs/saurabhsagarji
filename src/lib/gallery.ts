import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/types/database';
import { getProxyUrl } from '@/lib/storage-url';

type Album = Database['public']['Tables']['gallery_albums']['Row'];
type Photo = Database['public']['Tables']['gallery_photos']['Row'];

export type PublicAlbum = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  album_date: string | null;
};

export type PublicPhoto = {
  id: string;
  image_url: string;
  caption_hi: string | null;
  caption_en: string | null;
  alt_text: string | null;
};

function toPublicAlbum(row: Album): PublicAlbum {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    description_hi: row.description_hi,
    description_en: row.description_en,
    cover_image_url: getProxyUrl(row.cover_image_url),
    album_date: row.album_date,
  };
}

function toPublicPhoto(row: Photo): PublicPhoto {
  return {
    id: row.id,
    image_url: getProxyUrl(row.image_url),
    caption_hi: row.caption_hi,
    caption_en: row.caption_en,
    alt_text: row.alt_text,
  };
}

/**
 * All published albums, for the public gallery tabs.
 * Cached and cookie-free (see getPublishedBhajans in bhajans.ts for why).
 */
export const getPublishedAlbums = unstable_cache(
  async (): Promise<PublicAlbum[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('is_published', true)
      .order('title_hi', { ascending: true });

    if (error) {
      console.error('[getPublishedAlbums]', error);
      return [];
    }
    return (data ?? []).map(toPublicAlbum);
  },
  ['getPublishedAlbums'],
  { revalidate: 60 }
);

/** Build-time / static-context variant — no cookies, safe in generateStaticParams. */
export async function getPublishedAlbumsStatic(): Promise<PublicAlbum[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('is_published', true)
    .order('title_hi', { ascending: true });

  if (error) {
    console.error('[getPublishedAlbumsStatic]', error);
    return [];
  }
  return (data ?? []).map(toPublicAlbum);
}

/**
 * All photos in a published album, ordered for display.
 * Cached and cookie-free (see getPublishedBhajans in bhajans.ts for why).
 */
export const getPhotosForAlbum = unstable_cache(
  async (albumId: string): Promise<PublicPhoto[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getPhotosForAlbum]', error);
      return [];
    }
    return (data ?? []).map(toPublicPhoto);
  },
  ['getPhotosForAlbum'],
  { revalidate: 60 }
);

/**
 * A cross-album sampler for the homepage marquee — pulls a handful of photos
 * from each of the first few published albums and round-robins them into one
 * list, so the scrolling row actually mixes albums instead of showing one
 * album's photos back to back (which is all a plain "first album" pick gives).
 */
export async function getGalleryPreviewPhotos(
  perAlbum = 4,
  maxAlbums = 6
): Promise<PublicPhoto[]> {
  const albums = await getPublishedAlbums();
  const byAlbum = await Promise.all(
    albums.slice(0, maxAlbums).map((album) => getPhotosForAlbum(album.id))
  );
  const trimmed = byAlbum.map((photos) => photos.slice(0, perAlbum));

  const mixed: PublicPhoto[] = [];
  const longest = trimmed.reduce((max, photos) => Math.max(max, photos.length), 0);
  for (let i = 0; i < longest; i++) {
    for (const photos of trimmed) {
      if (photos[i]) mixed.push(photos[i]);
    }
  }
  return mixed;
}

/** Admin: every album regardless of publish state. */
export async function getAllAlbumsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .order('title_hi', { ascending: true });

  if (error) {
    console.error('[getAllAlbumsForAdmin]', error);
    return [];
  }
  return data ?? [];
}

/** Admin: a single album by id, with its photo count. */
export async function getAlbumForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getAlbumForAdmin]', error);
    return null;
  }
  return data;
}

/** Admin: all photos in an album (published or not — admin sees everything). */
export async function getPhotosForAlbumAdmin(albumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPhotosForAlbumAdmin]', error);
    return [];
  }
  return data ?? [];
}