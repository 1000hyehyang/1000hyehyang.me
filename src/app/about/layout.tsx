import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

const description =
  "1000hyehyang의 Resume";

export const metadata: Metadata = {
  title: "About",
  description,
  keywords: ["여채현", "백엔드 개발자", "개발자 포트폴리오", "1000hyehyang", "thousandhyehyang"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About | ${SITE_CONFIG.name}`,
    description,
    url: "/about",
    type: "profile",
    firstName: "채현",
    lastName: "여",
    username: "1000hyehyang",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.authorName} 개발자 프로필`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${SITE_CONFIG.name}`,
    description,
    images: ["/opengraph-image"],
  },
};

const profilePageStructuredData = serializeJsonLd({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${absoluteUrl("/about")}#profile-page`,
  url: absoluteUrl("/about"),
  name: `About | ${SITE_CONFIG.name}`,
  description,
  inLanguage: SITE_CONFIG.language,
  mainEntity: {
    "@id": `${SITE_CONFIG.url}/#person`,
  },
  isPartOf: {
    "@id": `${SITE_CONFIG.url}/#website`,
  },
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reading-shell py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: profilePageStructuredData }}
      />
      {children}
    </div>
  );
}


