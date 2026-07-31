import type { Element, Root, RootContent } from "hast";
import type { Plugin } from "unified";

const CODE_BLOCK_WRAPPER_CLASS = "code-block-wrapper";
const COPY_BUTTON_MOUNT_CLASS = "copy-code-button";

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

function isCodeBlock(node: RootContent): node is Element {
  return (
    isElement(node) &&
    node.tagName === "pre" &&
    node.children.some(
      (child) => child.type === "element" && child.tagName === "code",
    )
  );
}

function createCodeBlockWrapper(codeBlock: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: [CODE_BLOCK_WRAPPER_CLASS] },
    children: [
      codeBlock,
      {
        type: "element",
        tagName: "div",
        properties: { className: [COPY_BUTTON_MOUNT_CLASS] },
        children: [],
      },
    ],
  };
}

function wrapCodeBlocks(parent: Root | Element): void {
  const children = parent.children as RootContent[];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (isCodeBlock(child)) {
      children[index] = createCodeBlockWrapper(child);
      continue;
    }

    if (isElement(child)) {
      wrapCodeBlocks(child);
    }
  }
}

/** Adds a stable React mount point next to every fenced code block. */
export const rehypeCodeBlocks: Plugin<[], Root> = () => (tree) => {
  wrapCodeBlocks(tree);
};
