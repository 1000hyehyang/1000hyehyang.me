type LegacyRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  {
    source: "/portfolio/projects",
    destination: "/portfolio",
    permanent: true,
  },
  { source: "/about", destination: "/", permanent: true },
  {
    source: "/blog",
    destination: "https://blog.1000hyehyang.me",
    permanent: true,
  },
];
