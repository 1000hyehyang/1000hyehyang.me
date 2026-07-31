import "server-only";

import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeCodeBlocks } from "./rehypeCodeBlocks";
import { markdownSanitizeSchema } from "./sanitizeSchema";
import type { SanitizedMarkdownHtml } from "./types";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHighlight, { detect: false })
  .use(rehypeCodeBlocks)
  // Keep this last so every generated node is checked before serialization.
  .use(rehypeSanitize, markdownSanitizeSchema)
  .use(rehypeStringify);

export async function renderMarkdown(
  source: string,
): Promise<SanitizedMarkdownHtml> {
  const file = await markdownProcessor.process(source);
  return String(file) as SanitizedMarkdownHtml;
}
