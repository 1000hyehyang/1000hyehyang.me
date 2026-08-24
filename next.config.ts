import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/legacy-redirects";

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
      ...LEGACY_REDIRECTS,
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
