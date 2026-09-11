const PROJECT_TECH_CATEGORIES = new Map<string, string>(Object.entries({
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
}));

function getProjectTechCategory(techName: string): string | undefined {
  return PROJECT_TECH_CATEGORIES.get(techName);
}

export function groupProjectTechByCategory(
  techs: readonly string[],
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const tech of techs) {
    const category = getProjectTechCategory(tech) ?? "Other";
    (grouped[category] ??= []).push(tech);
  }

  return grouped;
}
