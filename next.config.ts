import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, 
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, 
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY", 
          },
        ],
      },
    ];
  },
};

export default nextConfig;