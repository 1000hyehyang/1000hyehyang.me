import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BottomNav } from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "홍길동 블로그 & 포트폴리오",
    template: "%s | 홍길동 블로그"
  },
  description: "Next.js, TypeScript, 최신 UI/UX 기반의 개발자 블로그 & 포트폴리오",
  openGraph: {
    title: "홍길동 블로그 & 포트폴리오",
    description: "Next.js, TypeScript, 최신 UI/UX 기반의 개발자 블로그 & 포트폴리오",
    url: "https://your-domain.com",
    siteName: "홍길동 블로그",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "홍길동 블로그 OG 이미지"
      }
    ],
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "홍길동 블로그 & 포트폴리오",
    description: "Next.js, TypeScript, 최신 UI/UX 기반의 개발자 블로그 & 포트폴리오",
    images: ["/og/default.png"]
  },
  metadataBase: new URL("https://your-domain.com")
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <header className="w-full px-6 py-4">
            <div className="w-full max-w-[768px] mx-auto flex justify-end">
              <ThemeToggle />
            </div>
          </header>
          <main className="min-h-[80vh] container mx-auto px-4 py-8 pb-24">
            <div className="w-full max-w-[768px] mx-auto px-0">{children}</div>
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
