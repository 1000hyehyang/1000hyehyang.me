export type DevelopmentPrinciple = {
  acronym: string;
  fullName: string;
  description: string;
};

export const DEVELOPMENT_PRINCIPLES: DevelopmentPrinciple[] = [
  {
    acronym: "KISS",
    fullName: "Keep It Simple, Stupid",
    description: "복잡한 해결책보다 간단한 해결책을 선호합니다. 불필요한 복잡성을 피하고 코드를 이해하기 쉽게 유지합니다."
  },
  {
    acronym: "YAGNI",
    fullName: "You Aren't Gonna Need It",
    description: "현재 요구에 맞는 구조와 책임을 명확히 하는 데 집중합니다. 필요해지는 시점에 자연스럽게 확장할 수 있는 설계를 지향합니다."
  },
  {
    acronym: "DRY",
    fullName: "Don't Repeat Yourself",
    description: "코드의 중복을 최소화하고 재사용 가능한 컴포넌트를 만듭니다. 유지보수성을 높이고 일관성을 유지합니다."
  }
];
