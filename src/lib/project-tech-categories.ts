const PROJECT_TECH_CATEGORIES = new Map<string, string>(Object.entries({
  "Hugging Face": "AI",
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
  "Next.js": "Frontend",
  "React": "Frontend",
  "TypeScript": "Frontend",
  "Typescript": "Frontend",
  "Vite": "Frontend",
  "Capacitor": "Frontend",
  "Android": "Frontend",
  "MySQL": "Database",
  "Redis": "Database",
  "PostgresSQL": "Database",
  "PostgreSQL": "Database",
  "MongoDB": "Database",
  "Oracle": "Database",
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
  "Unity": "Tool",
  "Blender": "Tool",
  "Figma": "Tool",
}));

export function groupProjectTechByCategory(
  techs: readonly string[],
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const tech of techs) {
    const category = PROJECT_TECH_CATEGORIES.get(tech) ?? "Other";
    (grouped[category] ??= []).push(tech);
  }

  return grouped;
}
