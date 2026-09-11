import { getAllPortfolio } from "@/lib/mdx";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import {
  getPortfolioPath,
  isPortfolioInFilter,
} from "@/lib/portfolio";
import type { Metadata } from "next";
import type { PortfolioFilter } from "@/types";
import { SITE_CONFIG } from "@/lib/config";
import { absoluteUrl, DEFAULT_OG_IMAGE, serializeJsonLd } from "@/lib/seo";

const description =
  "프로젝트와 해커톤 여정을 한눈에. 서툴던 시작부터 지금까지의 배움의 흔적을 담았습니다.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  keywords: [
    "여채현",
    "백엔드 포트폴리오",
    "1000hyehyang",
    "thousandhyehyang",
    "개발자 포트폴리오"
  ],
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projects | ${SITE_CONFIG.name}`,
    description,
    url: "/projects",
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects | ${SITE_CONFIG.name}`,
    description,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function PortfolioListPage() {
  const allProjects = getAllPortfolio();
  const pinnedProjects = allProjects.filter((project) => project.pinned);
  const projects = allProjects.filter((project) => !project.pinned);
  const archiveStats: Record<PortfolioFilter, number> = {
    total: allProjects.length,
    dev: allProjects.filter((project) => isPortfolioInFilter(project, "dev"))
      .length,
    hackathons: allProjects.filter((project) =>
      isPortfolioInFilter(project, "hackathons"),
    ).length,
    design: allProjects.filter((project) =>
      isPortfolioInFilter(project, "design"),
    ).length,
  };
  const portfolioStructuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/projects")}#collection`,
    url: absoluteUrl("/projects"),
    name: `Projects | ${SITE_CONFIG.name}`,
    description,
    inLanguage: SITE_CONFIG.language,
    isPartOf: {
      "@id": `${SITE_CONFIG.url}/#website`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allProjects.length,
      itemListElement: allProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(getPortfolioPath(project)),
        name: project.title,
        image: project.images?.[0] ? absoluteUrl(project.images[0]) : undefined,
      })),
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: portfolioStructuredData }}
      />
      <PortfolioList
        projects={projects}
        pinnedProjects={pinnedProjects}
        archiveStats={archiveStats}
      />
    </>
  );
}
