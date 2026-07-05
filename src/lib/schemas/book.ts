import { z } from 'zod';

/**
 * Reusable slug pattern.
 * Lowercase letters, numbers, hyphens; no spaces or special chars.
 * Matches how we want URLs to look: /books/shanti-ka-marg.
 */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The canonical Book input schema.
 * Used by:
 * - Server Actions (validate incoming form data)
 * - Client form (infer form state type, drive input validation)
 *
 * Design note: many fields are optional/nullable because a book might be a
 * work-in-progress draft. The published/unpublished distinction is handled
 * separately, not by requiring all fields.
 */
export const bookInputSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(120, 'Slug is too long')
    .regex(slugPattern, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  title_hi: z
    .string()
    .min(1, 'Hindi title is required')
    .max(300, 'Title is too long'),

  title_en: z
    .string()
    .max(300, 'Title is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  description_hi: z
    .string()
    .max(5000, 'Description is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  description_en: z
    .string()
    .max(5000, 'Description is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  cover_image_url: z
    .string()
    .url('Must be a valid URL')
    .nullish()
    .or(z.literal('').transform(() => undefined)),

  pdf_url: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),  

  purchase_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  download_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  publication_year: z
    .number()
    .int('Must be a whole number')
    .min(1900, 'Year seems too old')
    .max(new Date().getFullYear() + 1, 'Year is in the future')
    .optional(),

  preview_pdf_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  is_published: z.boolean().default(false),
});

export type BookInput = z.infer<typeof bookInputSchema>;

