"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

export const IntroSection = () => {
  return (
    <motion.section variants={itemVariants} className="w-full max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold mb-4">안녕하세요, 여채현입니다.</h1>
      
      <p className="text-muted-foreground leading-relaxed">
        다양한 분야에 끊임없이 도전하며 새로운 경험을 추구합니다. 깔끔하고 안정적인 코드 구조와 탄탄한 아키텍처 설계에 관심이 많으며, 특히 Spring Boot와 Java를 중심으로 체계적인 백엔드 시스템을 만드는 데 강점을 가지고 있습니다.
      </p>
      
      <p className="text-muted-foreground leading-relaxed">
        항상 &ldquo;능동적인 태도&rdquo;를 중요하게 생각합니다. 프로젝트의 문제를 적극적으로 발견하고 개선점을 먼저 제안하며, 팀원들과 원활하게 소통하기 위해 노력합니다. 또한 개발 과정에서 발생하는 다양한 이슈들에 대해 철저히 고민하며, 최적의 솔루션을 찾기 위해 항상 노력합니다.
      </p>
      
      <p className="text-muted-foreground leading-relaxed">
        사용자 중심적인 관점에서 UI/UX 개발에도 꾸준한 관심을 가지며, 프론트엔드 팀과 적극적으로 협업하여 보다 나은 사용성을 제공하는 백엔드를 지향합니다.
      </p>
      
      <p className="text-muted-foreground leading-relaxed">
        앞으로도 사용자와 동료 개발자 모두에게 신뢰를 줄 수 있는 개발자가 되는 것을 목표로, 적극적이고 꾸준한 성장의 자세를 이어가겠습니다.
      </p>
    </motion.section>
  );
}; 