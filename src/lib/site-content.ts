import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/lib/supabase/static';

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
 *
 * Cached (see module note at the bottom) — this read runs on every single
 * page's metadata, so leaving it cookie-bound forced every page on the site
 * into fully dynamic SSR just to read a few rows of static copy.
 */
export const getSiteContent = unstable_cache(
  async (key: SiteContentKey, lang: Language = DEFAULT_LANGUAGE): Promise<string> => {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('site_content')
      .select('value_hi, value_en')
      .eq('key', key)
      .single();

    if (!data) return key;

    const primary = lang === 'hi' ? data.value_hi : data.value_en;
    const fallback = lang === 'hi' ? data.value_en : data.value_hi;

    return primary ?? fallback ?? key;
  },
  ['getSiteContent'],
  { revalidate: 60 }
);

/**
 * Fetch multiple keys at once. More efficient than calling getSiteContent
 * repeatedly (single database round-trip instead of N).
 * Returns an object mapping each key to its resolved value.
 */
export const getSiteContentBatch = unstable_cache(
  async <K extends SiteContentKey>(keys: readonly K[], lang: Language = DEFAULT_LANGUAGE): Promise<Record<K, string>> => {
    const supabase = createStaticClient();
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
  },
  ['getSiteContentBatch'],
  { revalidate: 60 }
) as <K extends SiteContentKey>(keys: readonly K[], lang?: Language) => Promise<Record<K, string>>;