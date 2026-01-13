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

// 기술 이름으로 카테고리를 찾는 함수
export const getTechCategory = (techName: string): string | null => {
  for (const category of TECH_STACK) {
    if (category.technologies.some(tech => tech === techName)) {
      return category.category;
    }
  }
  return null;
};

// 기술 배열을 카테고리별로 그룹화하는 함수
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
