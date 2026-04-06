export default function truncateUrl(url, max = 50) {
  if (!url) return '—'
  if (url.length <= max) return url
  return `${url.slice(0, max)}…`
}
