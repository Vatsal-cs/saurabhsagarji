import { createClient } from '@/lib/supabase/server';

/**
 * Language preference for the site.
 * Hindi/Sanskrit is primary; English is fallback.
 * Later we can promote this to a URL parameter or user preference.
 */
export type Language = 'hi' | 'en';
export const DEFAULT_LANGUAGE: Language = 'hi';

/**
 * Type describing all known site_content keys.
 * Keeps the code honest — if you type getSiteContent('foo') where 'foo'
 * isn't a real key, TypeScript will yell.
 */
export type SiteContentKey =
  | 'home_hero_headline'
  | 'home_hero_subtitle'
  | 'home_welcome_heading'
  | 'home_welcome_body'
  | 'home_quote_text'
  | 'about_page_heading'
  | 'about_biography'
  | 'about_mission'
  | 'about_philosophy'
  | 'site_name'
  | 'site_tagline'
  | 'footer_copyright';

/**
 * Fetch a single site_content value in the requested language.
 * Falls back to English if the requested language is empty for that key.
 * Falls back to the key itself as a last resort so nothing renders as "null".
 */
export async function getSiteContent(
  key: SiteContentKey,
  lang: Language = DEFAULT_LANGUAGE
): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('value_hi, value_en')
    .eq('key', key)
    .single();

  if (!data) return key;

  const primary = lang === 'hi' ? data.value_hi : data.value_en;
  const fallback = lang === 'hi' ? data.value_en : data.value_hi;

  return primary ?? fallback ?? key;
}

/**
 * Fetch multiple keys at once. More efficient than calling getSiteContent
 * repeatedly (single database round-trip instead of N).
 * Returns an object mapping each key to its resolved value.
 */
export async function getSiteContentBatch<K extends SiteContentKey>(
  keys: readonly K[],
  lang: Language = DEFAULT_LANGUAGE
): Promise<Record<K, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('key, value_hi, value_en')
    .in('key', [...keys]);

  const result = {} as Record<K, string>;
  for (const key of keys) {
    const row = data?.find((r) => r.key === key);
    if (!row) {
      result[key] = key;
      continue;
    }
    const primary = lang === 'hi' ? row.value_hi : row.value_en;
    const fallback = lang === 'hi' ? row.value_en : row.value_hi;
    result[key] = primary ?? fallback ?? key;
  }
  return result;
}