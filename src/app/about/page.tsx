"use client";
import Image from "next/image";
import { TimelineItem } from "@/types";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  EDUCATION_DATA, 
  ORGANIZATION_DATA,
  AWARDS_DATA, 
  CERTIFICATION_DATA 
} from "@/lib/about-data";

// 공통 아이템 컴포넌트
const ItemComponent = ({ item, index, className = "mb-6" }: { item: TimelineItem; index: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`flex gap-4 items-start ${className}`}
    >
      {/* 로고 */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
        <Image
          src={item.logo}
          alt={item.logoAlt}
          width={64}
          height={64}
          style={{ objectFit: 'contain' }}
          className="w-full h-full"
          aria-hidden="true"
          unoptimized
          priority
        />
      </div>
      
      {/* 정보 */}
      <div className="flex-1">
        {item.url ? (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-semibold text-foreground mb-1 hover:text-orange-300 transition-colors cursor-pointer"
          >
            {item.title}
          </a>
        ) : (
          <div className="text-sm font-semibold text-foreground mb-1">{item.title}</div>
        )}
        <div className="text-xs text-muted-foreground mb-2">{item.description}</div>
        <div className="text-xs text-muted-foreground mb-3">{item.period}</div>
        
        {/* 활동 목록 */}
        {item.activities && item.activities.length > 0 && (
          <div className="space-y-1">
            {item.activities.map((activity, activityIndex) => (
              <div key={activityIndex} className="text-xs text-muted-foreground flex items-start">
                <span className="text-orange-300 mr-2">•</span>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 타임라인 아이템 컴포넌트 (수상 내역용)
const TimelineItemComponent = ({ item, index }: { item: TimelineItem; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg mb-6"
    >
      <div className="text-xs text-muted-foreground mb-1">{item.period}</div>
      <div className="flex items-center gap-2 mb-1">
        <div style={{ position: 'relative', width: 24, height: 24 }}>
          <Image
            src={item.logo}
            alt={item.logoAlt}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-xs"
            aria-hidden="true"
            unoptimized
            priority
          />
        </div>
        <span className="text-sm font-semibold">{item.title}</span>
      </div>
      {item.description && (
        <div className="text-xs text-muted-foreground">{item.description}</div>
      )}
    </motion.div>
  );
};

// 학력 섹션
const EducationSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="mb-16">
      {items.map((item, index) => (
        <ItemComponent key={`${item.title}-${index}`} item={item} index={index} className="mb-6" />
      ))}
    </div>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

// 조직 활동 섹션
const OrganizationSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="mb-16">
      {items.map((item, index) => (
        <ItemComponent key={`${item.title}-${index}`} item={item} index={index} className="mb-8" />
      ))}
    </div>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

// 수상 내역 섹션
const TimelineSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="mb-16">
      {items.map((item, index) => (
        <TimelineItemComponent key={`${item.title}-${index}`} item={item} index={index} />
      ))}
    </div>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

// 자격증 그리드 컴포넌트
const CertificationGrid = ({ items }: { items: TimelineItem[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Certification.</h2>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {items.map((item, index) => (
          <motion.div
            key={`${item.title}-${index}`}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.6 }}
            className="bg-muted/25 dark:bg-muted/40 p-4 rounded-lg hover:bg-muted/40 dark:hover:bg-muted/60 hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div style={{ position: 'relative', width: 32, height: 32 }}>
                <Image
                  src={item.logo}
                  alt={item.logoAlt}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-sm"
                  aria-hidden="true"
                  unoptimized
                  priority
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.period}</div>
              </div>
            </div>
            {item.description && (
              <div className="text-xs text-muted-foreground mt-2">{item.description}</div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default function AboutPage() {
  return (
    <section className="mx-auto">
      <EducationSection title="Education." items={EDUCATION_DATA} />
      <OrganizationSection title="Organization." items={ORGANIZATION_DATA} />
      <TimelineSection title="Awards." items={AWARDS_DATA} />
      <CertificationGrid items={CERTIFICATION_DATA} />
    </section>
  );
}
