export function getBaseUrl() {
  // 1. Di browser, pakai relative URL
  if (typeof window !== "undefined") return "";

  // 2. Di Vercel, VERCEL_URL otomatis diisi (tanpa https)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fallback ke NEXT_PUBLIC_SITE_URL (localhost atau apa pun)
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
