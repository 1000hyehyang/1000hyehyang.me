export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  name: process.env.NEXT_PUBLIC_SITE_NAME || "",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "",
} as const;

export const SITE_LINKS = {
  blog: "https://blog.1000hyehyang.me",
} as const;
