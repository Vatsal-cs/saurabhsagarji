import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.133"],

  serverExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist'],

  experimental: {
    serverActions: {
      bodySizeLimit: '55mb',
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

export default nextConfig;