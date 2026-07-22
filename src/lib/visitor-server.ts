import "server-only";

import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export function getVisitorRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function getVisitorClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cloudflareIp = headersList.get("cf-connecting-ip");

  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  if (cloudflareIp) return cloudflareIp;
  return "localhost";
}
