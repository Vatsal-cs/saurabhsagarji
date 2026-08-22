import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {},
  },
  allowedDevOrigins: ["192.168.31.133"],

  serverExternalPackages: ['sharp', 'pdfjs-dist'],

  experimental: {
    proxyClientMaxBodySize: '300mb',
    serverActions: {
      bodySizeLimit: '300mb',
    },
  },

  images: {
    // Uploaded photos never change in place (edits upload a new file with a
    // new timestamped path), so there's no reason for Vercel's image cache to
    // treat them as stale after the 60s default and re-pull from Supabase on
    // the next pageview. A long TTL here is what actually makes repeat
    // visitors share one cached copy instead of each one re-triggering
    // Supabase egress.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
