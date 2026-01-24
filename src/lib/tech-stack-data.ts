export type TechStackCategory = {
  category: string;
  technologies: readonly string[];
};

export const TECH_STACK: TechStackCategory[] = [
  {
    category: "Backend",
    technologies: ["Spring Boot", "Java", "Python", "C#"]
  },
  {
    category: "Frontend",
    technologies: ["React", "TypeScript", "Next.js"]
  },
  {
    category: "DevOps",
    technologies: ["Docker", "AWS", "GitHub Actions"]
  },
  {
    category: "Tool",
    technologies: ["Unity", "Figma", "Adobe Photoshop", "Adobe Illustrator"]
  }
] as const;

// 프로젝트용 기술 카테고리 매핑 (홈 화면 TECH_STACK과 별도 관리)
const PROJECT_TECH_CATEGORIES: Record<string, string> = {
  // Backend
  "Spring Boot": "Backend",
  "JPA": "Backend",
  "FastAPI": "Backend",
  "Java": "Backend",
  "Python": "Backend",
  "C#": "Backend",
  "RabbitMQ": "Backend",
  "WebSocket": "Backend",
  "QueryDSL": "Backend",
  // Frontend
  "Next.js": "Frontend",
  "React": "Frontend",
  "TypeScript": "Frontend",
  "Typescript": "Frontend",
  "Vite": "Frontend",
  // Database
  "MySQL": "Database",
  "Redis": "Database",
  "PostgresSQL": "Database",
  "MongoDB": "Database",
  "Oracle": "Database",
  // DevOps
  "Docker": "DevOps",
  "AWS": "DevOps",
  "GitHub Actions": "DevOps",
  "Nginx": "DevOps",
  "Prometheus": "DevOps",
  "Grafana": "DevOps",
  "Loki": "DevOps",
  // Tool
  "Unity": "Tool",
  "Figma": "Tool",
};

// 기술 이름으로 카테고리를 찾는 함수
export const getTechCategory = (techName: string): string | null => {
  for (const category of TECH_STACK) {
    if (category.technologies.some(tech => tech === techName)) {
      return category.category;
    }
  }
  return null;
};

// 기술 배열을 카테고리별로 그룹화하는 함수 (홈 화면용)
export const groupTechByCategory = (techs: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  techs.forEach((tech) => {
    const category = getTechCategory(tech) || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(tech);
  });
  
  return grouped;
};

// 프로젝트용 기술 카테고리를 찾는 함수
export const getProjectTechCategory = (techName: string): string | null => {
  return PROJECT_TECH_CATEGORIES[techName] || null;
};

// 프로젝트용 기술 배열을 카테고리별로 그룹화하는 함수
export const groupProjectTechByCategory = (techs: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  techs.forEach((tech) => {
    const category = getProjectTechCategory(tech) || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(tech);
  });
  
  return grouped;
};
