"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyCvPassword } from "@/lib/cv-auth";
import { renderMarkdown } from "@/lib/markdown/renderMarkdown";

export async function unlockCv(password: unknown) {
  if (typeof password !== "string" || !verifyCvPassword(password)) return null;

  const [source, photo] = await Promise.all([
    readFile(path.join(process.cwd(), "private/cv/resume.md"), "utf8"),
    readFile(path.join(process.cwd(), "private/cv/photo.jpg")),
  ]);
  const bodyStart = source.search(/^## /m);
  if (bodyStart < 0) throw new Error("CV must include a section heading");
  const [profileHtml, bodyHtml] = await Promise.all([
    renderMarkdown(source.slice(0, bodyStart)),
    renderMarkdown(source.slice(bodyStart)),
  ]);
  return { profileHtml, bodyHtml, photo: `data:image/jpeg;base64,${photo.toString("base64")}` };
}
