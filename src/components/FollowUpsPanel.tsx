import { BellRing, Check, PhoneOutgoing } from 'lucide-react'
import type { CallHistoryEntry } from '../types'
import { relativeTime } from '../lib/format'

interface Props {
  followUps: CallHistoryEntry[]
  onCallBack: (personId: string) => void
  onClear: (id: string) => void
}

/** Callback queue: calls an agent flagged for follow-up, surfaced until cleared. */
export function FollowUpsPanel({ followUps, onCallBack, onClear }: Props) {
  if (followUps.length === 0) return null

  return (
    <section
      className="surface animate-fade-up overflow-hidden rounded-2xl border-warn/25 shadow-card"
      style={{ animationDelay: '150ms' }}
    >
      <div className="flex items-center gap-2 border-b border-white/8 bg-warn/[0.06] px-5 py-3">
        <BellRing className="h-4 w-4 text-warn" />
        <h2 className="font-display text-sm font-bold text-white">Follow-ups</h2>
        <span className="tnum rounded-full bg-warn/15 px-1.5 text-[10px] font-semibold text-warn">
          {followUps.length}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Callbacks pending
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {followUps.map(f => (
          <li key={f.id} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-gray-100">
                  {f.person?.name ?? 'Unknown caller'}
                </span>
                {f.reason && (
                  <span className="rounded bg-white/5 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-ink-500">
                    {f.reason}
                  </span>
                )}
                <span className="font-mono text-[10px] text-ink-600">{relativeTime(f.logged_at)}</span>
              </div>
              {f.note && <div className="mt-0.5 truncate text-xs text-ink-500">{f.note}</div>}
            </div>
            <button
              onClick={() => onCallBack(f.person_id)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-signal/30 bg-signal/10 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-signal-soft transition-colors hover:bg-signal/20"
            >
              <PhoneOutgoing className="h-3 w-3" />
              Call back
            </button>
            <button
              onClick={() => onClear(f.id)}
              title="Mark handled"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/8 text-ink-500 transition-colors hover:bg-live/10 hover:text-live"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
