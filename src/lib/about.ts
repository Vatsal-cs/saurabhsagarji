import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/types/database';

type Section = Database['public']['Tables']['about_sections']['Row'];

export type PublicAboutSection = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  intro_hi: string | null;
  intro_en: string | null;
  body_hi: string | null;
  body_en: string | null;
  photo_1_url: string | null;
  photo_2_url: string | null;
  display_order: number;
};

function toPublic(row: Section): PublicAboutSection {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    intro_hi: row.intro_hi,
    intro_en: row.intro_en,
    body_hi: row.body_hi,
    body_en: row.body_en,
    photo_1_url: row.photo_1_url,
    photo_2_url: row.photo_2_url,
    display_order: row.display_order,
  };
}

/** All published sections, ordered — used for the nav dropdown. */
export async function getPublishedAboutSections(): Promise<PublicAboutSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPublishedAboutSections]', error);
    return [];
  }
  return (data ?? []).map(toPublic);
}

/** Build-time variant, no cookies — safe in generateStaticParams. */
export async function getPublishedAboutSectionsStatic(): Promise<PublicAboutSection[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPublishedAboutSectionsStatic]', error);
    return [];
  }
  return (data ?? []).map(toPublic);
}

export async function getPublishedAboutSectionBySlug(slug: string): Promise<PublicAboutSection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('[getPublishedAboutSectionBySlug]', error);
    return null;
  }
  return data ? toPublic(data) : null;
}

/** Admin: every section regardless of publish state, in display order. */
export async function getAllAboutSectionsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getAllAboutSectionsForAdmin]', error);
    return [];
  }
  return data ?? [];
}

export async function getAboutSectionForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getAboutSectionForAdmin]', error);
    return null;
  }
  return data;
}
