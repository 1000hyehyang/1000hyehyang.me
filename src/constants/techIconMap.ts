const ICON_NAMES = [
  "ARCore",
  "AWS",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Apache Maven",
  "Apoc",
  "Argo CD",
  "Azure",
  "Blender",
  "Bootstrap",
  "C",
  "C#",
  "C++",
  "CSS3",
  "Cloudflare",
  "DBeaver",
  "Dart",
  "Django",
  "Django REST",
  "Docker",
  "ESLint",
  "Ec2",
  "FastAPI",
  "Fastify",
  "Figma",
  "Firebase",
  "Flask",
  "Gemini",
  "Git",
  "GitHub (1)",
  "GitHub Actions",
  "Go",
  "Gradle",
  "Grafana",
  "GraphQL",
  "HTML5",
  "Hibernate",
  "JSON",
  "JUnit",
  "Java",
  "JPA",
  "JavaScript",
  "Jenkins",
  "Kotlin",
  "Kubernetes",
  "Linux",
  "Loki",
  "MRTK",
  "Markdown",
  "Material UI",
  "Meta",
  "Metacore",
  "MongoDB",
  "MySQL",
  "NET",
  "NET core",
  "NGINX",
  "Nest.js",
  "Next.js",
  "Node.js",
  "Nodemon",
  "NumPy",
  "OpenCV",
  "Openai",
  "Oracle",
  "PostCSS",
  "PostgresSQL",
  "Postman",
  "PM",
  "Prometheus",
  "PyTorch",
  "Python",
  "R",
  "RabbitMQ",
  "Raspberry Pi",
  "React",
  "Redis",
  "Render",
  "Sass",
  "Sidequest",
  "Socket.io",
  "Spring",
  "Swagger",
  "Tailwind CSS",
  "Three.js",
  "TypeScript",
  "Unity",
  "Vercel",
  "Vite.js",
  "Vue.js",
  "WebRTC",
  "jQuery",
] as const;

const ICON_NAME_LOOKUP = ICON_NAMES.reduce<Record<string, string>>((acc, name) => {
  acc[name.toLowerCase()] = name;
  return acc;
}, {});

const CUSTOM_ICON_NAME_ENTRIES: Array<[string, string]> = [
  ["spring boot", "Spring"],
  ["arfoundation", "ARCore"],
  ["idea", "PM"],
  ["unity xr interaction toolkit", "Unity"],
];

const CUSTOM_ICON_NAME_MAP = CUSTOM_ICON_NAME_ENTRIES.reduce<Record<string, string>>((acc, [alias, target]) => {
  acc[alias.toLowerCase()] = target;
  return acc;
}, {});

const getMatchingIconName = (tech: string) => {
  const lower = tech.toLowerCase();

  return ICON_NAME_LOOKUP[lower] ?? CUSTOM_ICON_NAME_MAP[lower] ?? null;
};

export const hasTechIcon = (tech: string) => Boolean(getMatchingIconName(tech));

export const getTechIconSrc = (tech: string) => {
  const matchedName = getMatchingIconName(tech);

  if (!matchedName) {
    return null;
  }

  return `/icons/${encodeURIComponent(`${matchedName}.svg`)}`;
};

