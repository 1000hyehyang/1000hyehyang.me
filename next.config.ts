import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eaalkymxyfskjojh.public.blob.vercel-storage.com",
        pathname: "/about/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    esmExternals: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
  // non-www → www 리디렉션
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '1000hyehyang.me',
          },
        ],
        destination: 'https://www.1000hyehyang.me/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
