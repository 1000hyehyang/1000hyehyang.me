declare module '*.mdx' {
  let MDXComponent: (props: Record<string, unknown>) => JSX.Element;
  export default MDXComponent;
  export const frontmatter: Record<string, unknown>;
} 