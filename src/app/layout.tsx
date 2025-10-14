import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BottomNav } from "@/components/layout/BottomNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/lib/config";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} OG 이미지`
      }
    ],
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ["/og/default.png"]
  }
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": SITE_CONFIG.name,
              "url": SITE_CONFIG.url,
              "description": SITE_CONFIG.description,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${SITE_CONFIG.url}/blog?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <TooltipProvider>
            <header className="w-full px-6 py-4">
              <div className="w-full max-w-[768px] mx-auto flex justify-end">
                <ThemeToggle />
              </div>
            </header>
            <main className="min-h-[80vh] container mx-auto px-4 py-8 pb-24">
              <div className="w-full max-w-[768px] mx-auto px-0">{children}</div>
            </main>
            <BottomNav />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
