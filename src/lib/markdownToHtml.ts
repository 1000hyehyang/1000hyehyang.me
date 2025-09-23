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

  // 코드 블록에 복사 버튼 추가
  html = html.replace(
    /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
    (match, attributes, code) => {
      // HTML 엔티티 디코딩
      let decodedCode = code;
      
      if (typeof window === 'undefined') {
        // 서버 사이드: 수동 치환
        decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#x60;/g, '`')
          .replace(/&#x3C;/g, '<')
          .replace(/&#x3E;/g, '>')
          .replace(/&#x3D;/g, '=')
          .replace(/&#x2F;/g, '/')
          .replace(/&#x22;/g, '"')
          .replace(/&#x5B;/g, '[')
          .replace(/&#x5D;/g, ']')
          .replace(/&#x7B;/g, '{')
          .replace(/&#x7D;/g, '}')
          .replace(/&#x28;/g, '(')
          .replace(/&#x29;/g, ')')
          .replace(/&#x2B;/g, '+')
          .replace(/&#x2D;/g, '-')
          .replace(/&#x2A;/g, '*')
          .replace(/&#x5C;/g, '\\')
          .replace(/&#x3A;/g, ':')
          .replace(/&#x3B;/g, ';')
          .replace(/&#x2C;/g, ',')
          .replace(/&#x2E;/g, '.')
          .replace(/&#x21;/g, '!')
          .replace(/&#x3F;/g, '?')
          .replace(/&#x40;/g, '@')
          .replace(/&#x23;/g, '#')
          .replace(/&#x24;/g, '$')
          .replace(/&#x25;/g, '%')
          .replace(/&#x5E;/g, '^')
          .replace(/&#x26;/g, '&')
          .replace(/&#x7C;/g, '|')
          .replace(/&#x7E;/g, '~');
      } else {
        // 클라이언트 사이드: 브라우저 내장 함수 사용
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = code;
        decodedCode = tempDiv.textContent || tempDiv.innerText || code;
      }
      
      // Base64 인코딩하여 data 속성에 저장
      const encodedCode = btoa(unescape(encodeURIComponent(decodedCode)));
      
      return `<div class="code-block-wrapper relative">
        <pre><code${attributes}>${code}</code></pre>
        <div class="copy-code-button" data-code-encoded="${encodedCode}"></div>
      </div>`;
    }
  );

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