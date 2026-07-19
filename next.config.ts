import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {},
  },
  allowedDevOrigins: ["192.168.31.133"],

  serverExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist'],

  experimental: {
    proxyClientMaxBodySize: '300mb',
    serverActions: {
      bodySizeLimit: '300mb',
    },
  },

  images: {
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
