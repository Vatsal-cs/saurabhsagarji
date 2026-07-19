import { z } from 'zod';
import { extractYouTubeId } from '../youtube';

export const bhajanInputSchema = z.object({
  youtube_url: z
    .string()
    .min(1, 'Please paste a YouTube link')
    .refine((val) => extractYouTubeId(val) !== null, {
      message: 'Could not find a valid YouTube video in that link',
    }),
  is_published: z.boolean().default(false),
});

export type BhajanInput = z.infer<typeof bhajanInputSchema>;
