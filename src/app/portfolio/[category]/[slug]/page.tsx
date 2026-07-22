import { getPortfolioBySlug, getAllPortfolio } from "@/lib/mdx";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { getPortfolioDisplayCategory, getPortfolioStartTime } from "@/lib/portfolio";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

type PortfolioDetailPageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  const projects = getAllPortfolio();
  return projects.map((project) => ({
    category: project.category,
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const item = getPortfolioBySlug(category, slug);
  if (!item) {
    return {
      title: "프로젝트를 찾을 수 없습니다",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const projectUrl = `/portfolio/${category}/${slug}`;
  const description =
    item.frontmatter.summary ??
    `${SITE_CONFIG.authorName}이 진행한 ${item.frontmatter.title} 프로젝트입니다.`;
  const image = item.frontmatter.images?.[0];
  const startTime = getPortfolioStartTime(item.frontmatter.period);

  return {
    title: item.frontmatter.title,
    description,
    keywords: [
      item.frontmatter.title,
      ...item.frontmatter.tech,
      getPortfolioDisplayCategory(item.frontmatter),
      SITE_CONFIG.authorName,
    ],
    authors: [
      {
        name: SITE_CONFIG.authorName,
        url: "/about",
      },
    ],
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: item.frontmatter.title,
      description,
      type: "article",
      url: projectUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      publishedTime:
        startTime > 0 ? new Date(startTime).toISOString() : undefined,
      authors: [absoluteUrl("/about")],
      section: getPortfolioDisplayCategory(item.frontmatter),
      tags: item.frontmatter.tech,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: `${item.frontmatter.title} 대표 이미지`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: item.frontmatter.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { category, slug } = await params;
  const item = getPortfolioBySlug(category, slug);
  if (!item) return notFound();

  const projectUrl = absoluteUrl(`/portfolio/${category}/${slug}`);
  const description =
    item.frontmatter.summary ??
    `${SITE_CONFIG.authorName}이 진행한 ${item.frontmatter.title} 프로젝트입니다.`;
  const startTime = getPortfolioStartTime(item.frontmatter.period);
  const relatedLinks = [
    item.frontmatter.githubUrl,
    item.frontmatter.siteUrl,
  ].filter((url): url is string => Boolean(url));
  const projectStructuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#project`,
        url: projectUrl,
        name: item.frontmatter.title,
        description,
        image: item.frontmatter.images,
        dateCreated:
          startTime > 0 ? new Date(startTime).toISOString() : undefined,
        inLanguage: SITE_CONFIG.language,
        genre: getPortfolioDisplayCategory(item.frontmatter),
        keywords: item.frontmatter.tech,
        creator: {
          "@id": `${SITE_CONFIG.url}/#person`,
        },
        isPartOf: {
          "@id": `${absoluteUrl("/portfolio")}#collection`,
        },
        sameAs: relatedLinks.length > 0 ? relatedLinks : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${projectUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: SITE_CONFIG.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "포트폴리오",
            item: absoluteUrl("/portfolio"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.frontmatter.title,
            item: projectUrl,
          },
        ],
      },
    ],
  });

  const htmlContent = await markdownToHtml(item.content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: projectStructuredData }}
      />
      <PortfolioDetail frontmatter={item.frontmatter}>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </PortfolioDetail>
    </>
  );
}
