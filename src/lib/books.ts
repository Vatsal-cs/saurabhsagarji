import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { createStaticClient } from '@/lib/supabase/static';
import { getProxyUrl } from '@/lib/storage-url';

/**
 * Row shape from the `books` table.
 * Sourced from the generated Database type so it stays in sync with the schema.
 */
export type Book = Database['public']['Tables']['books']['Row'];

/**
 * Public-facing shape. Trims fields the public doesn't need
 * (search_vector, created_by, etc.) and adds derived fields.
 * When we later add a real language selector, this is where language resolution
 * would happen so pages don't each do their own picking.
 */
export type PublicBook = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  purchase_url: string | null;
  download_url: string | null;
  preview_pdf_url: string | null;
  pdf_url: string | null;
  publication_year: number | null;
  published_at: string | null;
  display_order: number;
};

function toPublicBook(row: Book): PublicBook {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    description_hi: row.description_hi,
    description_en: row.description_en,
    cover_image_url: getProxyUrl(row.cover_image_url),
    purchase_url: row.purchase_url,
    download_url: getProxyUrl(row.download_url),
    preview_pdf_url: getProxyUrl(row.preview_pdf_url),
    pdf_url: getProxyUrl(row.pdf_url),
    publication_year: row.publication_year,
    published_at: row.published_at,
    display_order: row.display_order,
  };
}

/**
 * Fetch all published books, most recently published first.
 * RLS ensures only published books come back for anonymous requests.
 *
 * Cached and cookie-free (see getPublishedBhajans in bhajans.ts for why) —
 * this doesn't depend on the visitor, so there's no reason it was forcing
 * every visit to /books into a fresh dynamic render.
 */
export const getPublishedBooks = unstable_cache(
  async (): Promise<PublicBook[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getPublishedBooks]', error);
      return [];
    }

    return (data ?? []).map(toPublicBook);
  },
  ['getPublishedBooks'],
  { revalidate: 60 }
);

/**
 * Books an admin has pinned for the homepage drag deck — a curated subset of
 * getPublishedBooks, independent of the full /books catalogue.
 */
export const getHomePinnedBooks = unstable_cache(
  async (): Promise<PublicBook[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .eq('is_home_pinned', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getHomePinnedBooks]', error);
      return [];
    }

    return (data ?? []).map(toPublicBook);
  },
  ['getHomePinnedBooks'],
  { revalidate: 60 }
);

/**
 * Build-time variant of getPublishedBooks that doesn't touch cookies.
 * Use ONLY from generateStaticParams, sitemap, or similar build-only paths.
 */
export async function getPublishedBooksStatic(): Promise<PublicBook[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPublishedBooksStatic]', error);
    return [];
  }

  return (data ?? []).map(toPublicBook);
}

/**
 * Fetch a single published book by slug.
 * Returns null if not found (used for the detail page 404).
 */
export const getPublishedBookBySlug = unstable_cache(
  async (slug: string): Promise<PublicBook | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('[getPublishedBookBySlug]', error);
      return null;
    }

    return data ? toPublicBook(data) : null;
  },
  ['getPublishedBookBySlug'],
  { revalidate: 60 }
);

/**
 * Fetch ALL books, published or draft, for admin views.
 * RLS policy allows this only if the caller is_admin().
 * If a non-admin somehow calls this, they get an empty list (no error).
 */
export async function getAllBooksForAdmin(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getAllBooksForAdmin]', error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch a single book by id, published or draft, for admin edit views.
 */
export async function getBookByIdForAdmin(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getBookByIdForAdmin]', error);
    return null;
  }
  return data;
}

/**
 * Public, permanent URL for a PDF in the (now public) book-pdfs bucket.
 * Routes through the proxy domain to eliminate cached egress on Supabase.
 */
export function getPublicPdfUrl(pdfPath: string): string {
  if (pdfPath.startsWith('http')) return getProxyUrl(pdfPath);
  const directUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-pdfs/${pdfPath}`;
  return getProxyUrl(directUrl);
}

/**
 * Public download URL with Supabase's `?download=` param, routed via proxy.
 */
export function getPublicPdfDownloadUrl(
  pdfPath: string,
  slug: string,
  titleEn: string | null
): string {
  const url = getPublicPdfUrl(pdfPath);

  const base = (titleEn ?? slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const filename = `${base || slug}.pdf`;
  return `${url}?download=${encodeURIComponent(filename)}`;
}