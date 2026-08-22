import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {},
  },
  allowedDevOrigins: ["192.168.31.133"],

  serverExternalPackages: ['sharp', 'pdfjs-dist'],

  // `sharp` is used directly in server actions (resizeForUpload), not just
  // through next/image — Vercel's build-time file tracer doesn't reliably
  // follow sharp's dynamically-loaded native binary into the deployed
  // function bundle unless told to explicitly, which is what causes the
  // "libvips-cpp.so: cannot open shared object file" runtime error even
  // when the binary installed correctly during the build.
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/sharp/**/*',
      './node_modules/@img/**/*',
      // pnpm stores the actual platform binaries here, only symlinking the
      // current build platform's copy into the flat paths above — including
      // the nested store directly is a safety net in case the symlinked
      // path alone isn't enough for the tracer to follow.
      './node_modules/.pnpm/@img+sharp-linux-x64@*/**/*',
      './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**/*',
    ],
  },

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
