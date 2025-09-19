import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, defaultSchema)
    .use(rehypeStringify)
    .process(markdown);

  let html = String(file);

  // 외부 링크를 LinkPreview로 변환
  html = html.replace(
    /<a\s+([^>]*?)href=["'](https?:\/\/[^"']+)["']([^>]*?)>([^<]*?)<\/a>/gi,
    (match, beforeHref, url, afterHref, linkText) => {
      // 외부 링크를 LinkPreview로 변환
      return `<div class="link-preview-wrapper" data-url="${url}" data-link-text="${linkText}"></div>`;
    }
  );

  return html;
} 