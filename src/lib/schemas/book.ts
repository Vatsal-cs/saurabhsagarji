import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Canonical Book input schema. Trimmed to essentials:
 * slug, titles, descriptions, year, cover, pdf, publish flag.
 * cover_image_url is required (a book must have a cover).
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

  // Cover URL is filled server-side after upload. Optional in the schema
  // because the form sends the file, not the URL — the action enforces
  // that a cover exists (either newly uploaded or already on the book).
  cover_image_url: z
    .string()
    .url('Must be a valid URL')
    .nullish()
    .or(z.literal('').transform(() => undefined)),

  pdf_url: z
    .string()
    .max(500)
    .nullish()
    .or(z.literal('').transform(() => undefined)),

  publication_year: z
    .number()
    .int('Must be a whole number')
    .min(1900, 'Year seems too old')
    .max(new Date().getFullYear() + 1, 'Year is in the future')
    .optional(),

  is_published: z.boolean().default(false),
});

export type BookInput = z.infer<typeof bookInputSchema>;