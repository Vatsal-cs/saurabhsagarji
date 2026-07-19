import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const albumInputSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(120, 'Slug is too long')
    .regex(slugPattern, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title_hi: z.string().min(1, 'Hindi title is required').max(300),
  title_en: z
    .string()
    .max(300)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  description_hi: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  description_en: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  album_date: z
    .literal('').transform(() => undefined)
    .or(z.string().optional()),
  is_published: z.boolean().default(false),
});

export type AlbumInput = z.infer<typeof albumInputSchema>;
