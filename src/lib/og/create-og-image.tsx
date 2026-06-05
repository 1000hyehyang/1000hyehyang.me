import { ImageResponse } from "next/og";
import { OG_SIZE } from "./constants";
import { loadOgFonts } from "./fonts";
import { OgImageLayout } from "./OgImageLayout";

interface CreateOgImageOptions {
  siteName: string;
  title: string;
  description?: string;
  badge?: string;
  meta?: string;
  footer?: string;
}

export async function createOgImageResponse(options: CreateOgImageOptions) {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    <OgImageLayout
      siteName={options.siteName}
      title={options.title}
      description={options.description}
      badge={options.badge}
      meta={options.meta}
      footer={options.footer}
    />,
    {
      ...OG_SIZE,
      fonts,
    }
  );
}
