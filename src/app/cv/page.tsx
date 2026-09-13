import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCvAvailable } from "@/lib/cv-auth";
import { CvAccess } from "./CvAccess";

export const metadata: Metadata = {
  title: "여채현 CV",
  description: "백엔드 개발자 여채현의 학력, 프로젝트, 활동 및 수상 이력",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function CvPage() {
  if (!isCvAvailable()) notFound();
  return <CvAccess />;
}
