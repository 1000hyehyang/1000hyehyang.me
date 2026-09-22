import { ResumeContent } from "@/components/resume/ResumeContent";
import { getAllPortfolio } from "@/lib/mdx";

export default function Home() {
  const projects = getAllPortfolio().filter((project) => project.pinned);

  return <ResumeContent projects={projects} />;
}
