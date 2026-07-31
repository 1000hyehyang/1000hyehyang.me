import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type SanitizeSchema = NonNullable<Parameters<typeof rehypeSanitize>[0]>;

const HIGHLIGHT_SCOPE_CLASS = /^(?:hljs(?:-[\w-]+)?|[\w-]+_+)$/;

/**
 * Extends the GitHub-style defaults only with classes created by our own
 * syntax-highlighting and code-block plugins.
 */
export const markdownSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [["className", /^language-./, "hljs"]],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ["className", "code-block-wrapper", "copy-code-button"],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className", HIGHLIGHT_SCOPE_CLASS],
    ],
  },
};
