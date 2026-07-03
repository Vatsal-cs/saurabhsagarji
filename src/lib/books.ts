import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

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
  publication_year: number | null;
  published_at: string | null;
};

function toPublicBook(row: Book): PublicBook {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    description_hi: row.description_hi,
    description_en: row.description_en,
    cover_image_url: row.cover_image_url,
    purchase_url: row.purchase_url,
    download_url: row.download_url,
    preview_pdf_url: row.preview_pdf_url,
    publication_year: row.publication_year,
    published_at: row.published_at,
  };
}

/**
 * Fetch all published books, most recently published first.
 * RLS ensures only published books come back for anonymous requests.
 */
export async function getPublishedBooks(): Promise<PublicBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    // In prod we'd log to Sentry / an observability tool.
    // For now, surface it in server logs and return an empty list
    // so the page still renders (soft failure).
    console.error('[getPublishedBooks]', error);
    return [];
  }

  return (data ?? []).map(toPublicBook);
}

/**
 * Fetch a single published book by slug.
 * Returns null if not found (used for the detail page 404).
 */
export async function getPublishedBookBySlug(
  slug: string
): Promise<PublicBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle(); // maybeSingle: 0 or 1 rows, never errors on 0 (unlike single)

  if (error) {
    console.error('[getPublishedBookBySlug]', error);
    return null;
  }

  return data ? toPublicBook(data) : null;
}