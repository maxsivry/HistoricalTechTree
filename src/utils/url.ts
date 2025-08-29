export function toExternalHref(input: string): string {
  const raw = (input || "").trim()
  if (!raw) return "#"

  // Already has a scheme (http:, https:, mailto:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return raw

  // Protocol-relative URL
  if (raw.startsWith("//")) return `https:${raw}`

  // Internal path should remain as-is (still opens in new tab)
  if (raw.startsWith("/")) return raw

  // Looks like a domain (e.g., example.com or www.example.com)
  const domainLike = /^([a-z0-9-]+\.)+[a-z]{2,}([/:?#].*)?$/i
  if (raw.startsWith("www.") || domainLike.test(raw)) return `https://${raw}`

  // Fallback: leave unchanged (relative path)
  return raw
}

