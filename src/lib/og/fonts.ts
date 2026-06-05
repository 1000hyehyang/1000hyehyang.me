import type { SatoriOptions } from "next/dist/compiled/@vercel/og/satori";

type OgFont = NonNullable<SatoriOptions["fonts"]>[number];

let cachedFonts: OgFont[] | null = null;

const PRETENDARD_BASE =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff";

export async function loadOgFonts(): Promise<OgFont[]> {
  if (cachedFonts) return cachedFonts;

  const [regular, bold] = await Promise.all([
    fetch(`${PRETENDARD_BASE}/Pretendard-Regular.woff`).then((res) => {
      if (!res.ok) throw new Error(`Pretendard Regular font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    }),
    fetch(`${PRETENDARD_BASE}/Pretendard-Bold.woff`).then((res) => {
      if (!res.ok) throw new Error(`Pretendard Bold font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    }),
  ]);

  cachedFonts = [
    { name: "Pretendard", data: regular, weight: 400, style: "normal" },
    { name: "Pretendard", data: bold, weight: 700, style: "normal" },
  ];

  return cachedFonts;
}
