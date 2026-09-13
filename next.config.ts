import type { NextConfig } from "next";

const canonicalOrigin = "https://www.1000hyehyang.me";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eaalkymxyfskjojh.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "1000hyehyang.me",
          },
        ],
        destination: `${canonicalOrigin}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
