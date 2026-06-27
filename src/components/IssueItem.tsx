import { Check, Loader2 } from 'lucide-react'
import type { Issue } from '../types'
import { PRIORITY_META, CATEGORY_META } from '../lib/issueMeta'
import { daysSince } from '../lib/format'

interface Props {
  issue: Issue
  resolving: boolean
  onResolve: (issue: Issue) => void
}

export function IssueItem({ issue, resolving, onResolve }: Props) {
  const prio = PRIORITY_META[issue.priority]
  const cat = CATEGORY_META[issue.category]
  const CatIcon = cat.icon
  const age = daysSince(issue.created_at)
  const overdue = age > prio.slaDays

  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${prio.chip}`}>
        <CatIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-gray-100">{issue.description}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          <span className={`rounded px-1.5 py-px ${prio.chip}`}>{prio.label}</span>
          <span className="text-ink-500">{cat.label}</span>
          <span className="text-ink-600">·</span>
          <span className={overdue ? 'font-semibold text-alert' : 'text-ink-500'}>
            {age === 0 ? 'today' : `${age}d open`}
            {overdue && ' · overdue'}
          </span>
        </div>
      </div>
      <button
        onClick={() => onResolve(issue)}
        disabled={resolving}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-live/30 bg-live/10 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-live transition-colors hover:bg-live/20 disabled:opacity-50"
      >
        {resolving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Resolve
      </button>
    </li>
  )
}
