const FALLBACK = () => process.env.NEXT_PUBLIC_SITE_URL || "https://grooms.de";

/**
 * Public base URL for links in emails. Uses the host the request really came in on,
 * so links are right on Vercel previews, localhost and the final domain.
 * Only trusts known hosts; anything else falls back to NEXT_PUBLIC_SITE_URL.
 */
export function baseUrlFrom(headers: Headers): string {
  const host = (headers.get("x-forwarded-host") || headers.get("host") || "").toLowerCase();
  const proto = headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  let configuredHost = "";
  try {
    configuredHost = new URL(FALLBACK()).host.toLowerCase();
  } catch {}
  const trusted =
    host.endsWith(".vercel.app") ||
    host.startsWith("localhost") ||
    (configuredHost && (host === configuredHost || host === "www." + configuredHost));
  return trusted ? `${proto}://${host}` : FALLBACK().replace(/\/$/, "");
}
