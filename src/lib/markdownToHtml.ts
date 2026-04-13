import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code || []), ["className", /^hljs/]],
      },
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);

  let html = String(file);

  html = html.replace(
    /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>|<pre><code class="hljs([^>]*)">([\s\S]*?)<\/code><\/pre>/gi,
    (_match, attributes, code, hljsAttributes, hljsCode) => {
      const isHighlighted = hljsAttributes !== undefined;
      const finalAttributes = isHighlighted ? ` class="hljs${hljsAttributes}"` : attributes;
      const finalCode = isHighlighted ? hljsCode : code;
      let decodedCode = finalCode;

      if (typeof window === "undefined") {
        decodedCode = finalCode
          .replace(/<[^>]*>/g, "")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#x60;/g, "`")
          .replace(/&#x3C;/g, "<")
          .replace(/&#x3E;/g, ">")
          .replace(/&#x3D;/g, "=")
          .replace(/&#x2F;/g, "/")
          .replace(/&#x22;/g, '"')
          .replace(/&#x5B;/g, "[")
          .replace(/&#x5D;/g, "]")
          .replace(/&#x7B;/g, "{")
          .replace(/&#x7D;/g, "}")
          .replace(/&#x28;/g, "(")
          .replace(/&#x29;/g, ")")
          .replace(/&#x2B;/g, "+")
          .replace(/&#x2D;/g, "-")
          .replace(/&#x2A;/g, "*")
          .replace(/&#x5C;/g, "\\")
          .replace(/&#x3A;/g, ":")
          .replace(/&#x3B;/g, ";")
          .replace(/&#x2C;/g, ",")
          .replace(/&#x2E;/g, ".")
          .replace(/&#x21;/g, "!")
          .replace(/&#x3F;/g, "?")
          .replace(/&#x40;/g, "@")
          .replace(/&#x23;/g, "#")
          .replace(/&#x24;/g, "$")
          .replace(/&#x25;/g, "%")
          .replace(/&#x5E;/g, "^")
          .replace(/&#x26;/g, "&")
          .replace(/&#x7C;/g, "|")
          .replace(/&#x7E;/g, "~");
      } else {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = finalCode;
        decodedCode = tempDiv.textContent || tempDiv.innerText || finalCode;
      }

      const encodedCode = btoa(unescape(encodeURIComponent(decodedCode)));

      return `<div class="code-block-wrapper relative">
        <pre><code${finalAttributes}>${finalCode}</code></pre>
        <div class="copy-code-button" data-code-encoded="${encodedCode}"></div>
      </div>`;
    }
  );

  html = html.replace(
    /<a\s+([^>]*?)href=["'](https?:\/\/[^"']+)["']([^>]*?)>([^<]*?)<\/a>/gi,
    (_match, _beforeHref, url, _afterHref, linkText) =>
      `<div class="link-preview-wrapper" data-url="${url}" data-link-text="${linkText}"></div>`
  );

  return html;
}
