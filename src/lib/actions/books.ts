'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { bookInputSchema, type BookInput } from '@/lib/schemas/book';

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
    is_published: formData.get('is_published') === 'on',
  };
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error('Cover image must be under 5 MB');
  if (!file.type.startsWith('image/')) throw new Error('Cover must be an image file');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${slug}-cover-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
  return data.publicUrl;
}

async function uploadPdf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  slug: string
): Promise<string> {
  if (file.size > 50 * 1024 * 1024) throw new Error('PDF must be under 50 MB');
  if (file.type !== 'application/pdf') throw new Error('File must be a PDF');

  const path = `${slug}-${Date.now()}.pdf`;
  const { error } = await supabase.storage
    .from('book-pdfs')
    .upload(path, file, { contentType: 'application/pdf', upsert: false });

  if (error) throw new Error(`PDF upload failed: ${error.message}`);
  return path;
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

  try {
    const coverFile = formData.get('cover_image_file') as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadCover(supabase, coverFile, values.slug);
    }
    const pdfFile = formData.get('pdf_file') as File | null;
    if (pdfFile && pdfFile.size > 0) {
      pdfPath = await uploadPdf(supabase, pdfFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

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
      is_published: values.is_published,
      published_at: values.is_published ? new Date().toISOString() : null,
      created_by: adminId,
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
    .select('is_published, published_at, slug, cover_image_url, pdf_url')
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
    const pdfFile = formData.get('pdf_file') as File | null;
    if (pdfFile && pdfFile.size > 0) {
      pdfPath = await uploadPdf(supabase, pdfFile, values.slug);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }

  if (!coverUrl) {
    return { ok: false, error: 'A cover image is required.', fieldErrors: { cover_image_url: 'Please upload a cover image.' } };
  }

  const nowPublishing = values.is_published && !existing.is_published;

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
      is_published: values.is_published,
      published_at: nowPublishing ? new Date().toISOString() : existing.published_at,
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

export async function toggleBookPublished(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: existing } = await supabase
    .from('books')
    .select('is_published, published_at, slug')
    .eq('id', id)
    .single();
  if (!existing) return { ok: false, error: 'Book not found.' };
  const newPublished = !existing.is_published;
  const { error } = await supabase
    .from('books')
    .update({
      is_published: newPublished,
      published_at: newPublished && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/books');
  revalidatePath(`/books/${existing.slug}`);
  revalidatePath('/prabhat-gate/books');
  return { ok: true };
}