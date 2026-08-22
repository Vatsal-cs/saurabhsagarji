import { z } from 'zod';
import { extractYouTubeId } from '../youtube';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const eventInputSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(120, 'Slug is too long')
    .regex(slugPattern, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title_hi: z.string().min(1, 'Hindi title is required').max(300),
  title_en: z.string().min(1, 'English title is required').max(300),
  description_hi: z
    .string()
    .max(3000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  description_en: z
    .string()
    .max(3000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  venue_name: z
    .string()
    .max(300)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  venue_address: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  venue_map_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  start_datetime: z.string().min(1, 'Start date/time is required'),
  end_datetime: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  youtube_url: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined))
    .refine((val) => !val || extractYouTubeId(val) !== null, {
      message: 'Could not find a valid YouTube video in that link',
    }),
  is_published: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;
