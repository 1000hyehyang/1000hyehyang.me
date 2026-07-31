declare const sanitizedMarkdownHtmlBrand: unique symbol;

/** HTML that has passed through the markdown sanitization pipeline. */
export type SanitizedMarkdownHtml = string & {
  readonly [sanitizedMarkdownHtmlBrand]: true;
};
