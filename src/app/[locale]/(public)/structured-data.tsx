import { YOUTUBE_CHANNEL_URL, INSTAGRAM_URL } from '@/lib/social-links';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saurabhsagarji.in').replace(/\/$/, '');
const PORTRAIT_URL = `${SITE_URL}/site-photo.jpg`;

/**
 * JSON-LD on the homepage only — tells search engines this is the official
 * site for a specific named person (the Acharya) and organization, with
 * verified links to the real social profiles (`sameAs`). This is what lets
 * a search for the Acharya's name surface a richer result (site links,
 * sometimes a knowledge-panel-style box) instead of a plain blue link, and
 * helps Google disambiguate this site from any unrelated page that happens
 * to mention the same name.
 */
export function StructuredData({
  siteName,
  personName,
  personDescription,
}: {
  siteName: string;
  personName: string;
  personDescription: string | null;
}) {
  const sameAs = [YOUTUBE_CHANNEL_URL, INSTAGRAM_URL].filter(Boolean) as string[];

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteName.trim(),
        inLanguage: ['hi', 'en'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: personName.trim(),
        description: personDescription?.trim() || undefined,
        image: PORTRAIT_URL,
        url: SITE_URL,
        sameAs,
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
