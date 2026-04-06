export default function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return iso
  }
}
