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
  // when the binary installed correctly during the build. A broad
  // `@img/**/*` glob here previously pulled in ~200MB (every platform's
  // binary — Windows, Android, musl, ARM, ...) across every route, which
  // is almost certainly what crashed the build. This targets only the
  // exact Linux x64 (glibc) package Vercel's runtime actually needs.
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
