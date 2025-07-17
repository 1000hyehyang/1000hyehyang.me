"use client";
import Image from "next/image";
import { TimelineItem } from "@/types";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const EDUCATION_DATA: TimelineItem[] = [
  {
    period: "2022.03 - Now",
    title: "한국외국어대학교 서울캠퍼스",
    description: "EICC(영어통번역) & 융복합소프트웨어 전공",
    logo: "/college.png",
    logoAlt: "HUFS 로고"
  }
];

const EXPERIENCE_DATA: TimelineItem[] = [
  {
    period: "2024.03 - 2025.02",
    title: "XREAL 6th Dev",
    description: "Unity를 활용한 XR 콘텐츠 개발",
    logo: "/xreal.png",
    logoAlt: "XREAL 로고"
  },
  {
    period: "2024.10 - Now",
    title: "UMC 7th Design",
    description: "IT 연합 동아리 UMC 디자인 파트장",
    logo: "/umc.png",
    logoAlt: "UMC 로고"
  },
  {
    period: "2024.12",
    title: "XR 디바이스 콘텐츠 메이커톤 | 본선 진출",
    description: "Open AI와 yolo v11을 활용한 AR 인공지능 요리 어시스턴트 | 클라이언트 개발",
    logo: "/xreal.png",
    logoAlt: "XREAL 로고"
  },
  {
    period: "2025.01 - 2025.07",
    title: "프로그래머스 생성형 AI 활용 백엔드 데브코스 1기",
    description: "생성형 AI를 활용한 Spring Boot 백엔드 개발",
    logo: "/programmers.png",
    logoAlt: "프로그래머스 로고"
  }
];

const AWARDS_DATA: TimelineItem[] = [
  {
    period: "2024.07",
    title: "XREAL XR Hackathon 우수상",
    description: "레시피 추천 VR 어시스턴트 | 클라이언트 개발",
    logo: "/xreal.png",
    logoAlt: "XREAL 로고"
  },
  {
    period: "2024.10",
    title: "2024 메타버스 개발자 경진대회 우수상",
    description: "APOC을 활용한 KBO 구단 브랜딩 XR 웹 서비스 | 팀장",
    logo: "/apoc.png",
    logoAlt: "APOC 로고"
  }
];

const CERTIFICATION_DATA: TimelineItem[] = [
  {
    period: "2025.06",
    title: "GTQ-i 1급",
    description: "",
    logo: "/gtqi.png",
    logoAlt: "GTQ-i 로고"
  },
  {
    period: "2025.06",
    title: "SQLD",
    description: "",
    logo: "/k-data.png",
    logoAlt: "K-data 로고"
  },
  {
    period: "2025.08",
    title: "GTQ 1급",
    description: "",
    logo: "/gtq.png",
    logoAlt: "GTQ 로고"
  },
  {
    period: "2025.09",
    title: "ADsP",
    description: "",
    logo: "/k-data.png",
    logoAlt: "K-data 로고"
  }
];

const TimelineItemComponent = ({ item, index }: { item: TimelineItem; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <li className="flex gap-4 items-start">
      <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg"
      >
        <div className="text-xs text-muted-foreground mb-1">{item.period}</div>
        <div className="flex items-center gap-2 mb-1">
          <Image
            src={item.logo}
            alt={item.logoAlt}
            width={24}
            height={24}
            className="rounded-xs"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold">{item.title}</span>
        </div>
        {item.description && (
          <div className="text-xs text-muted-foreground">{item.description}</div>
        )}
      </motion.div>
    </li>
  );
};

const TimelineSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-14">
      {items.map((item, index) => (
        <TimelineItemComponent key={`${item.title}-${index}`} item={item} index={index} />
      ))}
    </ol>
  </>
);

export default function AboutPage() {
  return (
    <section className="mx-auto">
      <TimelineSection title="Education." items={EDUCATION_DATA} />
      <TimelineSection title="Experience." items={EXPERIENCE_DATA} />
      <TimelineSection title="Awards." items={AWARDS_DATA} />
      <TimelineSection title="Certification." items={CERTIFICATION_DATA} />
    </section>
  );
}
