import { z } from 'zod';
import { extractYouTubeId } from '../youtube';

export const teachingInputSchema = z.object({
  youtube_url: z
    .string()
    .min(1, 'Please paste a YouTube link')
    .refine((val) => extractYouTubeId(val) !== null, {
      message: 'Could not find a valid YouTube video in that link',
    }),
  pravachan_date: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  is_published: z.boolean().default(false),
});

export type TeachingInput = z.infer<typeof teachingInputSchema>;
