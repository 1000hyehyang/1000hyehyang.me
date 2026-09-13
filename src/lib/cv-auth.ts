import { createHash, timingSafeEqual } from "node:crypto";

function configuredPassword(): string | undefined {
  const password = process.env.CV_PASSWORD;
  return password && /^[0-9]{6}$/.test(password) ? password : undefined;
}

function equal(left: string, right: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(left), digest(right));
}

export function isCvAvailable(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function verifyCvPassword(value: string): boolean {
  if (!isCvAvailable()) return false;
  const password = configuredPassword();
  return !!password && /^[0-9]{6}$/.test(value) && equal(value, password);
}

export const cvPrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
