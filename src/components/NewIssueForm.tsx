import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import type { IssueCategory, Priority } from '../types'
import { PRIORITY_META, PRIORITY_ORDER, CATEGORY_META, CATEGORY_ORDER } from '../lib/issueMeta'

interface Props {
  onSubmit: (input: { description: string; category: IssueCategory; priority: Priority }) => Promise<void>
  onCancel: () => void
}

/** Report-a-problem form: the agent logs a NEW maintenance issue mid-call. */
export function NewIssueForm({ onSubmit, onCancel }: Props) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory>('plumbing')
  const [priority, setPriority] = useState<Priority>('urgent')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!description.trim()) return
    setSaving(true)
    try {
      await onSubmit({ description, category, priority })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-signal/30 bg-signal/[0.06] p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-soft">
          New maintenance issue
        </span>
        <button onClick={onCancel} className="text-ink-500 transition-colors hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <input
        autoFocus
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Describe the problem the caller is reporting…"
        className="w-full rounded-lg border border-white/8 bg-ink-900/60 px-3 py-2 text-sm text-gray-100 placeholder:text-ink-500 outline-none focus:border-signal/50"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Category
          </div>
          <div className="flex flex-wrap gap-1">
            {CATEGORY_ORDER.map(c => {
              const Icon = CATEGORY_META[c].icon
              const active = category === c
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  title={CATEGORY_META[c].label}
                  className={`grid h-7 w-7 place-items-center rounded-md border transition-colors ${
                    active
                      ? 'border-signal/50 bg-signal/20 text-signal-soft'
                      : 'border-white/8 bg-white/[0.02] text-ink-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Priority
          </div>
          <div className="flex gap-1">
            {PRIORITY_ORDER.map(p => {
              const active = priority === p
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-md border px-1.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    active
                      ? PRIORITY_META[p].chip + ' border-transparent'
                      : 'border-white/8 bg-white/[0.02] text-ink-500 hover:text-gray-300'
                  }`}
                >
                  {PRIORITY_META[p].label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!description.trim() || saving}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-signal to-signal-deep py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Log issue
      </button>
    </div>
  )
}
