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

// Education 섹션용 컴포넌트 (이미지와 같은 디자인)
const EducationItemComponent = ({ item, index }: { item: TimelineItem; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex gap-4 items-start mb-6"
    >
      {/* 로고 컨테이너 */}
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
      
      {/* 텍스트 정보 */}
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
        
        {/* 활동 내용 */}
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

// Organization 섹션용 컴포넌트 (활동 내용 포함)
const OrganizationItemComponent = ({ item, index }: { item: TimelineItem; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex gap-4 items-start mb-8"
    >
      {/* 로고 컨테이너 */}
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
      
      {/* 텍스트 정보 */}
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
        
        {/* 활동 내용 */}
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

// 기존 Timeline 컴포넌트 (Awards용)
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
    </li>
  );
};

// Education 섹션
const EducationSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="mb-16">
      {items.map((item, index) => (
        <EducationItemComponent key={`${item.title}-${index}`} item={item} index={index} />
      ))}
    </div>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

// Organization 섹션
const OrganizationSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="mb-16">
      {items.map((item, index) => (
        <OrganizationItemComponent key={`${item.title}-${index}`} item={item} index={index} />
      ))}
    </div>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

// Awards 섹션 (기존 Timeline 유지)
const TimelineSection = ({ title, items }: { title: string; items: TimelineItem[] }) => (
  <>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-16">
      {items.map((item, index) => (
        <TimelineItemComponent key={`${item.title}-${index}`} item={item} index={index} />
      ))}
    </ol>
    <hr className="border-t border-border/50 mb-16" />
  </>
);

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
