import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, PhoneIncoming, CornerDownLeft, User, Building2 } from 'lucide-react'
import type { DirectoryResult } from '../types'

interface Props {
  search: (query: string) => DirectoryResult[]
  onPickPerson: (personId: string) => void
  onSimulate: () => void
  onClose: () => void
}

type Item =
  | { type: 'action' }
  | { type: 'result'; result: DirectoryResult }

/** ⌘K command palette: search the directory or trigger a simulated call. */
export function CommandPalette({ search, onPickPerson, onSimulate, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const items = useMemo<Item[]>(() => {
    if (!query.trim()) return [{ type: 'action' }]
    return search(query).map(result => ({ type: 'result', result }))
  }, [query, search])

  useEffect(() => setActive(0), [query])

  const activate = (item: Item | undefined) => {
    if (!item) return
    if (item.type === 'action') onSimulate()
    else if (item.result.kind === 'person') onPickPerson(item.result.id)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      activate(items[active])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="surface w-full max-w-xl overflow-hidden rounded-2xl shadow-glow"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4">
          <Search className="h-4 w-4 text-ink-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tenants, owners, phone numbers…"
            className="flex-1 bg-transparent py-4 text-sm text-gray-100 placeholder:text-ink-500 outline-none"
          />
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-ink-500">No matches for “{query}”.</div>
          ) : (
            items.map((item, i) => {
              const selected = i === active
              const base = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selected ? 'bg-signal/15' : 'hover:bg-white/[0.03]'
              }`
              if (item.type === 'action') {
                return (
                  <button key="action" className={base} onMouseEnter={() => setActive(i)} onClick={onSimulate}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal/20 text-signal-soft">
                      <PhoneIncoming className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-100">Simulate incoming call</span>
                    {selected && <CornerDownLeft className="h-3.5 w-3.5 text-ink-500" />}
                  </button>
                )
              }
              const r = item.result
              if (r.kind === 'person') {
                return (
                  <button
                    key={`p-${r.id}`}
                    className={base}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => onPickPerson(r.id)}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-gray-300">
                      <User className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-100">{r.name}</span>
                      <span className="block font-mono text-[11px] text-ink-500">{r.phone}</span>
                    </span>
                    <span
                      className={`rounded px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider ${
                        r.role === 'owner' ? 'bg-signal/15 text-signal-soft' : 'bg-live/15 text-live'
                      }`}
                    >
                      {r.role}
                    </span>
                  </button>
                )
              }
              return (
                <div
                  key={`pr-${r.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-70"
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-ink-500">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-gray-300">{r.address}</span>
                    <span className="block font-mono text-[11px] text-ink-500">Unit {r.unit}</span>
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
