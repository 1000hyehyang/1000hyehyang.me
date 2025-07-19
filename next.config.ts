import createMDX from '@next/mdx';
import type { NextConfig } from "next";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// 허용할 이미지 도메인들
const ALLOWED_IMAGE_DOMAINS = [
  "avatars.githubusercontent.com",
  "github.com",
  "user-images.githubusercontent.com",
  "user-attachments.githubusercontent.com",
  "private-user-images.githubusercontent.com",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_DOMAINS.map(hostname => ({
      protocol: "https",
      hostname,
    })),
  },
  experimental: {
    esmExternals: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);
