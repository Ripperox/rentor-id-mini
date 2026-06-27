import { useState, useMemo } from 'react'
import { Search, Inbox, MessageSquareText } from 'lucide-react'
import type { CallHistoryEntry } from '../types'
import { relativeTime, clockTime } from '../lib/format'

interface Props {
  entries: CallHistoryEntry[]
  loading: boolean
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function CallHistory({ entries, loading }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(e =>
      [e.person?.name, e.property?.address, e.property?.unit, e.note, e.agent_name]
        .filter(Boolean)
        .some(v => v!.toLowerCase().includes(q)),
    )
  }, [entries, query])

  return (
    <section className="surface animate-fade-up rounded-2xl shadow-card" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-bold text-white">Call History</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            {entries.length} logged · persisted
          </p>
        </div>
        <div className="relative ml-auto w-44 sm:w-60">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search calls…"
            className="w-full rounded-lg border border-white/8 bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-ink-500 outline-none transition-colors focus:border-signal/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-white/5">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="h-9 w-9 animate-pulse-soft rounded-full bg-ink-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse-soft rounded bg-ink-700" />
                <div className="h-2.5 w-48 animate-pulse-soft rounded bg-ink-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
          <Inbox className="h-8 w-8 text-ink-600" />
          <p className="mt-3 text-sm text-gray-400">
            {entries.length === 0 ? 'No calls logged yet.' : 'No calls match your search.'}
          </p>
          {entries.length === 0 && (
            <p className="mt-1 text-xs text-ink-500">
              Simulate an incoming call, then log it to start the record.
            </p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {filtered.map(entry => {
            const name = entry.person?.name ?? 'Unknown caller'
            const isOwner = entry.person?.role === 'owner'
            return (
              <li
                key={entry.id}
                className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-700 text-[11px] font-bold text-gray-300">
                  {entry.person ? initialsOf(name) : '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-100">{name}</span>
                    {entry.person && (
                      <span
                        className={`rounded px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider ${
                          isOwner ? 'bg-signal/15 text-signal-soft' : 'bg-live/15 text-live'
                        }`}
                      >
                        {isOwner ? 'Owner' : 'Tenant'}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-xs text-ink-500">
                    {entry.property
                      ? `${entry.property.address} · ${entry.property.unit}`
                      : 'Property unknown'}
                  </div>
                  {entry.note && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-gray-300">
                      <MessageSquareText className="mt-px h-3 w-3 shrink-0 text-ink-500" />
                      <span className="min-w-0">{entry.note}</span>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="tnum text-xs text-gray-400">{clockTime(entry.logged_at)}</div>
                  <div className="font-mono text-[10px] text-ink-600">{relativeTime(entry.logged_at)}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
