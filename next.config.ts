import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {},
  },
  allowedDevOrigins: ["192.168.31.133"],

  serverExternalPackages: ['sharp'],

  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*',
      './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
    ],
  },

  experimental: {
    proxyClientMaxBodySize: '300mb',
    serverActions: {
      bodySizeLimit: '300mb',
    },
  },

  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'saurabhsagarji-media-proxy.vatsalj05.workers.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);