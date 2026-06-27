/** "Today" / "1 day ago" / "5 days ago" from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

/** Relative time for the call feed: "just now", "12m ago", "3h ago", or a date. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Clock time like "2:14 PM" for log rows. */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** Whole days since an ISO timestamp (never negative). */
export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

/** "$1,850/mo" from an integer cents amount. */
export function money(cents: number | null): string {
  if (cents == null) return '—'
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`
}

/** "Aug 2026" style month-year for lease dates. */
export function monthYear(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}
