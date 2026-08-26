const SUPABASE_ORIGIN =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ||
  'https://yvmrivgwbyzjpynnmust.supabase.co';

const PROXY_ORIGIN = process.env.NEXT_PUBLIC_STORAGE_PROXY_URL?.replace(/\/$/, '');

export function getProxyUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (PROXY_ORIGIN && url.startsWith(SUPABASE_ORIGIN)) {
    return url.replace(SUPABASE_ORIGIN, PROXY_ORIGIN);
  }
  return url;
}