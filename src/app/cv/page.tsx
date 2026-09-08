import type { Metadata } from "next";
import { CvAccess } from "./CvAccess";

export const metadata: Metadata = {
  title: "여채현 CV",
  description: "백엔드 개발자 여채현의 학력, 프로젝트, 활동 및 수상 이력",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function CvPage() {
  return <CvAccess />;
}
