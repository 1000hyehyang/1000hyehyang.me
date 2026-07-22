import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClickRipple } from "@/components/common/ClickRipple";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG, SITE_LINKS } from "@/lib/config";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: SITE_CONFIG.name,
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  keywords: [...SITE_CONFIG.keywords],
  authors: [
    {
      name: SITE_CONFIG.authorName,
      url: SITE_CONFIG.url,
    },
  ],
  creator: SITE_CONFIG.authorName,
  publisher: SITE_CONFIG.authorName,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  }
};

const websiteStructuredData = serializeJsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.url}/#website`,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      description: SITE_CONFIG.description,
      inLanguage: SITE_CONFIG.language,
      publisher: {
        "@id": `${SITE_CONFIG.url}/#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_CONFIG.url}/#person`,
      name: SITE_CONFIG.authorName,
      url: SITE_CONFIG.url,
      image: absoluteUrl("/profile.png"),
      jobTitle: "백엔드 개발자",
      sameAs: Object.values(SITE_LINKS),
      knowsAbout: [...SITE_CONFIG.keywords],
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: websiteStructuredData,
          }}
        />
      </head>
      <body className={`${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <ClickRipple />
          <TooltipProvider>
            <SiteHeader />
            <main
              id="main-content"
              className="min-h-[calc(100dvh-var(--site-header-height))]"
            >
              <div className="site-shell">{children}</div>
            </main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
