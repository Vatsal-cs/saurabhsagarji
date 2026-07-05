import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { createStaticClient } from '@/lib/supabase/static';

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
    pdf_url: row.pdf_url,
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
 * Build-time variant of getPublishedBooks that doesn't touch cookies.
 * Use ONLY from generateStaticParams, sitemap, or similar build-only paths.
 */

export async function getPublishedBooksStatic(): Promise<PublicBook[]> {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
  
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
      .order('updated_at', { ascending: false });
  
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
 * Generate a short-lived signed URL for a private PDF in book-pdfs bucket.
 * Called at read time. URL expires after the given seconds (default 1 hour).
 *
 * If pdfPath is already a full URL (e.g. externally hosted), returns it unchanged.
 */
export async function getSignedPdfUrl(
  pdfPath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (pdfPath.startsWith('http')) return pdfPath;

  const { createServiceClient } = await import('@/lib/supabase/static');
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from('book-pdfs')
    .createSignedUrl(pdfPath, expiresInSeconds);

  if (error) {
    console.error('[getSignedPdfUrl]', error);
    return null;
  }
  return data.signedUrl;
}