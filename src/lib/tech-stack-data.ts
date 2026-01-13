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
