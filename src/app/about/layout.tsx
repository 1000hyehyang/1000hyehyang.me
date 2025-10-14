import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "[Web발신] (광고) 천혜향♥ 신상정 보 방금 공 개❗열람 주의⚠ 수신거부▶ 없음💦",
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


