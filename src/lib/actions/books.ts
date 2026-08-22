'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { bookInputSchema, type BookInput } from '@/lib/schemas/book';
import { resizeForUpload } from '@/lib/image-resize';

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .single();

  if (!admin || !admin.is_active) throw new Error('Not authorized');
  return { supabase, adminId: admin.id };
}

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof BookInput, string>>;
    };

function toFieldErrors(err: import('zod').ZodError<BookInput>) {
  const map: Partial<Record<keyof BookInput, string>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof BookInput;
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function formDataToBookInput(formData: FormData): unknown {
  const yearRaw = formData.get('publication_year');
  return {
    slug: formData.get('slug'),
    title_hi: formData.get('title_hi'),
    title_en: formData.get('title_en'),
    description_hi: formData.get('description_hi'),
    description_en: formData.get('description_en'),
    publication_year:
      yearRaw && String(yearRaw).trim() !== '' ? Number(yearRaw) : undefined,
    is_home_pinned: formData.get('is_home_pinned') === 'on',
  };
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string
): Promise<string> {
  if (file.size > 4 * 1024 * 1024) throw new Error('Cover image must be under 4 MB');
  if (!file.type.startsWith('image/')) throw new Error('Cover must be an image file');

  const resized = await resizeForUpload(file);
  const path = `${slug}-cover-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(path, resized, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
  return data.publicUrl;
}

export async function createBook(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { supabase, adminId } = await assertAdmin();

  const parsed = bookInputSchema.safeParse(formDataToBookInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;
  let coverUrl: string | null = null;
  let pdfPath: string | null = null;

  // New books join at the end of the display order (not display_order's
  // column default of 0), so they don't jump ahead of the existing catalogue —
  // an admin can still drag them anywhere via the reorder grid.
  const { data: lastBook } = await supabase
    .from('books')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextDisplayOrder = (lastBook?.display_order ?? -1) + 1;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCover(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  // The PDF is uploaded directly from the browser to Supabase Storage (see
  // PdfDropzone) rather than through this Server Action — a Server Action's
  // payload goes through Vercel's request body, which has a hard ~4.5MB
  // limit that a book PDF blows past in an instant, well below the app's
  // own 50MB limit. The form just hands over the resulting storage path.
  pdfPath = (formData.get('pdf_path') as string | null) || null;

  if (!coverUrl) {
    return { ok: false, error: 'A cover image is required.', fieldErrors: { cover_image_url: 'Please upload a cover image.' } };
  }
  if (!pdfPath) {
    return { ok: false, error: 'A book PDF is required.', fieldErrors: { pdf_url: 'Please upload the book PDF.' } };
  }

  const { data, error } = await supabase
    .from('books')
    .insert({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      pdf_url: pdfPath,
      publication_year: values.publication_year ?? null,
      is_published: true,
      is_home_pinned: values.is_home_pinned,
      published_at: new Date().toISOString(),
      created_by: adminId,
      display_order: nextDisplayOrder,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A book with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/books');
  revalidatePath('/prabhat-gate/books');
  redirect(`/prabhat-gate/books/${data.id}/edit`);
}

export async function updateBook(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();

  const parsed = bookInputSchema.safeParse(formDataToBookInput(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const values = parsed.data;

  const { data: existing } = await supabase
    .from('books')
    .select('published_at, slug, cover_image_url, pdf_url')
    .eq('id', id)
    .single();

  if (!existing) return { ok: false, error: 'Book not found.' };

  let coverUrl = existing.cover_image_url;
  let pdfPath = existing.pdf_url;

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCover(supabase, coverFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  // Uploaded directly from the browser to Storage — see createBook for why.
  const newPdfPath = formData.get('pdf_path') as string | null;
  if (newPdfPath) pdfPath = newPdfPath;

  if (!coverUrl) {
    return { ok: false, error: 'A cover image is required.', fieldErrors: { cover_image_url: 'Please upload a cover image.' } };
  }

  const { error } = await supabase
    .from('books')
    .update({
      slug: values.slug,
      title_hi: values.title_hi,
      title_en: values.title_en ?? null,
      description_hi: values.description_hi ?? null,
      description_en: values.description_en ?? null,
      cover_image_url: coverUrl,
      pdf_url: pdfPath,
      publication_year: values.publication_year ?? null,
      // A book is always published once it's saved — no draft state exists —
      // so every edit self-heals a pre-migration draft into published too.
      is_published: true,
      is_home_pinned: values.is_home_pinned,
      published_at: existing.published_at ?? new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A book with that slug already exists.', fieldErrors: { slug: 'Slug must be unique' } };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/books');
  revalidatePath(`/books/${existing.slug}`);
  if (existing.slug !== values.slug) revalidatePath(`/books/${values.slug}`);
  revalidatePath('/prabhat-gate/books');

  return { ok: true };
}

export async function deleteBook(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase.from('books').select('slug').eq('id', id).single();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/books');
  if (existing?.slug) revalidatePath(`/books/${existing.slug}`);
  revalidatePath('/prabhat-gate/books');
  redirect('/prabhat-gate/books');
}

/**
 * Persists a new front-to-back order for the whole catalogue in one go —
 * called from the admin's drag-to-reorder grid with every book id in its
 * new position. `display_order` becomes the id's index in that array.
 */
export async function reorderBooks(orderedIds: string[]): Promise<ActionResult> {
  const { supabase } = await assertAdmin();

  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from('books').update({ display_order: index }).eq('id', id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath('/books');
  revalidatePath('/prabhat-gate/books');
  return { ok: true };
}