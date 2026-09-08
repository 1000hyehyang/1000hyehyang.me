import { NextResponse } from "next/server";
import { cvPrivateHeaders } from "@/lib/cv-auth";

export function middleware() {
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(cvPrivateHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: ["/cv/:path*"],
  runtime: "nodejs",
};
