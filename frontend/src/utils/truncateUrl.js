export default function truncateUrl(url, max = 60) {
  if (!url) return ''
  if (url.length <= max) return url
  const start = url.slice(0, Math.round(max * 0.6))
  const end = url.slice(-Math.round(max * 0.3))
  return `${start}…${end}`
}
