import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saurabhsagarji.in').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/prabhat-gate', '/api', '/auth'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
