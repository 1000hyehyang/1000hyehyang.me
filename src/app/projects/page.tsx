import { getAllPortfolio } from "@/lib/mdx";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import { parsePortfolioFilter } from "@/lib/portfolio";
import type { Metadata } from "next";
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

type PortfolioListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PortfolioListPage({
  searchParams,
}: PortfolioListPageProps) {
  const params = await searchParams;
  const initialFilter = parsePortfolioFilter(
    firstParam(params.filter),
  );
  const projects = getAllPortfolio();
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
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(
          `/projects/${project.category}/${project.slug}`,
        ),
        name: project.title,
        image: project.images?.[0],
      })),
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: portfolioStructuredData }}
      />
      <PortfolioList projects={projects} initialFilter={initialFilter} />
    </>
  );
}
