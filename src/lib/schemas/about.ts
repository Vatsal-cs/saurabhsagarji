import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const aboutSectionInputSchema = z.object({
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
  intro_hi: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  intro_en: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  body_hi: z
    .string()
    .max(20000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  body_en: z
    .string()
    .max(20000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_published: z.boolean().default(false),
});

export type AboutSectionInput = z.infer<typeof aboutSectionInputSchema>;
