import { NextRequest, NextResponse } from "next/server";
import { fetchLinkMetadata } from "@/lib/link-metadata/server";

export const preferredRegion = "icn1";

function validateRequestUrl(raw: string | null): string | NextResponse {
  if (!raw) {
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        { error: "HTTP 또는 HTTPS URL만 허용됩니다." },
        { status: 400 }
      );
    }
    return raw;
  } catch {
    return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const urlParam = new URL(request.url).searchParams.get("url");
    const validated = validateRequestUrl(urlParam);
    if (validated instanceof NextResponse) return validated;

    const metadata = await fetchLinkMetadata(validated);

    return NextResponse.json(metadata, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=600" },
    });
  } catch (error) {
    console.error("link-metadata GET:", error);
    return NextResponse.json(
      { error: "메타데이터를 가져올 수 없습니다." },
      { status: 500 }
    );
  }
}
