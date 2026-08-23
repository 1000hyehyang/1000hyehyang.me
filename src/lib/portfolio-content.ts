const INFO_BLOCK_PATTERN =
  /<!--\s*portfolio:info:start\s*-->([\s\S]*?)<!--\s*portfolio:info:end\s*-->/gi;

type PortfolioContentSections = {
  core: string;
  info?: string;
};

export function splitPortfolioContent(
  source: string,
): PortfolioContentSections {
  const infoParts: string[] = [];
  const core = source
    .replace(INFO_BLOCK_PATTERN, (_, infoContent: string) => {
      const trimmedInfo = infoContent.trim();
      if (trimmedInfo) infoParts.push(trimmedInfo);
      return "";
    })
    .trim();

  return {
    core,
    info: infoParts.length > 0 ? infoParts.join("\n\n") : undefined,
  };
}
