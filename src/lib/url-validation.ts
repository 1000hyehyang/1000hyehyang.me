const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.goog",
]);

function parseIpv4Octets(hostname: string): number[] | null {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;

  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  return octets;
}

function isPrivateIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function isBlockedFetchUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;

  const ipv4Octets = parseIpv4Octets(hostname);
  if (ipv4Octets && isPrivateIpv4(ipv4Octets)) return true;

  return false;
}
