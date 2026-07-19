/**
 * Extracts an 11-character YouTube video ID from any common URL format:
 * - https://www.youtube.com/watch?v=VIDEOID
 * - https://youtu.be/VIDEOID
 * - https://www.youtube.com/shorts/VIDEOID
 * - https://m.youtube.com/watch?v=VIDEOID
 * - https://www.youtube.com/embed/VIDEOID
 * Returns null if no valid ID could be extracted.
 */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}
