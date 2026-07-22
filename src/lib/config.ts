const DEFAULT_SITE_URL = "https://www.1000hyehyang.me";
const DEFAULT_SITE_NAME = "1000hyehyang.me";

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  name: process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME,
  title: "여채현 | 백엔드 개발자 포트폴리오",
  authorName: "여채현",
  description:
    "개발자 1000hyehyang의 포트폴리오입니다.",
  locale: "ko_KR",
  language: "ko-KR",
  keywords: [
    "여채현",
    "1000hyehyang",
    "thousandhyehyang",
    "포트폴리오"
  ],
} as const;

export const SITE_LINKS = {
  blog: "https://blog.1000hyehyang.me",
  github: "https://github.com/1000hyehyang",
  linkedin: "https://www.linkedin.com/in/1000hyehyang",
  instagram: "https://www.instagram.com/thousandhyehyang",
} as const;
