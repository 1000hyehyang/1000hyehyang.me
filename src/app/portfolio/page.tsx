import { getAllPortfolio } from "@/lib/mdx";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import { parsePortfolioFilter } from "@/lib/portfolio";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

const description =
  "프로젝트와 해커톤 여정을 한눈에. 서툴던 시작부터 지금까지의 배움의 흔적을 담았습니다.";

export const metadata: Metadata = {
  title: "포트폴리오",
  description,
  keywords: [
    "여채현",
    "백엔드 포트폴리오",
    "1000hyehyang",
    "thousandhyehyang",
    "개발자 포트폴리오"
  ],
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: `포트폴리오 | ${SITE_CONFIG.name}`,
    description,
    url: "/portfolio",
    type: "website",
    images: [
      {
        url: "/portfolio/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.authorName} 포트폴리오`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `포트폴리오 | ${SITE_CONFIG.name}`,
    description,
    images: ["/portfolio/opengraph-image"],
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
    firstParam(params.filter) ?? firstParam(params.category),
  );
  const projects = getAllPortfolio();
  const portfolioStructuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/portfolio")}#collection`,
    url: absoluteUrl("/portfolio"),
    name: `포트폴리오 | ${SITE_CONFIG.name}`,
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
          `/portfolio/${project.category}/${project.slug}`,
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
