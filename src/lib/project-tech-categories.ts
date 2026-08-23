const PROJECT_TECH_CATEGORIES: Record<string, string> = {
  // AI
  "Hugging Face": "AI",
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
  "Spring Mail": "Backend",
  "FCM": "Backend",
  "S3": "DevOps",
  // Frontend
  "Next.js": "Frontend",
  "React": "Frontend",
  "TypeScript": "Frontend",
  "Typescript": "Frontend",
  "Vite": "Frontend",
  "Capacitor": "Frontend",
  "Android": "Frontend",
  // Database
  "MySQL": "Database",
  "Redis": "Database",
  "PostgresSQL": "Database",
  "PostgreSQL": "Database",
  "MongoDB": "Database",
  "Oracle": "Database",
  // DevOps
  "Docker": "DevOps",
  "AWS": "DevOps",
  "GitHub Actions": "DevOps",
  "Nginx": "DevOps",
  "RDS": "DevOps",
  "CloudFront": "DevOps",
  "Cloudflare": "DevOps",
  "HAProxy": "DevOps",
  "Prometheus": "DevOps",
  "Grafana": "DevOps",
  "Loki": "DevOps",
  // Tool
  "Unity": "Tool",
  "Blender": "Tool",
  "Figma": "Tool",
};

function getProjectTechCategory(techName: string): string | null {
  return PROJECT_TECH_CATEGORIES[techName] || null;
}

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
