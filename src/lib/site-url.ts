const DEFAULT_SITE_URL = "https://openwatch-osint-updated.vercel.app";

function normalizeSiteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_SITE_URL;

  return normalizeSiteUrl(candidate).replace(/\/$/, "");
}
