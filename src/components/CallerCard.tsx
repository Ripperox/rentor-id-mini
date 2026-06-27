import { useState, useEffect } from 'react'
import {
  Phone,
  MapPin,
  Copy,
  Check,
  CircleAlert,
  Users,
  ClipboardCheck,
  PhoneOff,
  Loader2,
} from 'lucide-react'
import type { CallerContext, Issue } from '../types'
import { timeAgo } from '../lib/format'

interface Props {
  context: CallerContext
  onResolveIssue: (issueId: string) => Promise<void>
  onLogCall: (note: string) => Promise<void>
  onClose: () => void
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function CallerCard({ context, onResolveIssue, onLogCall, onClose }: Props) {
  const { person, property, coResidents } = context
  const [issues, setIssues] = useState<Issue[]>(context.issues)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [logging, setLogging] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const duration = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  const isOwner = person.role === 'owner'
  const openIssues = issues.filter(i => i.status === 'open')

  const copyPhone = () => {
    navigator.clipboard.writeText(person.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleResolve = async (issue: Issue) => {
    setResolvingId(issue.id)
    try {
      await onResolveIssue(issue.id)
      setIssues(prev => prev.map(i => (i.id === issue.id ? { ...i, status: 'resolved' } : i)))
    } catch {
      /* parent surfaces the error toast */
    } finally {
      setResolvingId(null)
    }
  }

  const handleLog = async () => {
    setLogging(true)
    try {
      await onLogCall(note)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="surface animate-scale-in flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-glow">
      {/* Header */}
      <div className="relative shrink-0 border-b border-white/8 bg-gradient-to-b from-signal/12 to-transparent px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-signal-soft">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
          </span>
          Connected
          <span className="ml-auto tnum rounded bg-white/5 px-1.5 py-0.5 text-gray-400">{duration}</span>
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-signal to-signal-deep text-base font-bold text-white shadow-glow">
            {initialsOf(person.name)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-extrabold leading-tight text-white">
              {person.name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  isOwner ? 'bg-signal/20 text-signal-soft' : 'bg-live/15 text-live'
                }`}
              >
                {isOwner ? 'Owner' : 'Tenant'}
              </span>
              <button
                onClick={copyPhone}
                className="group flex items-center gap-1.5 font-mono text-xs text-gray-400 transition-colors hover:text-gray-200"
              >
                <Phone className="h-3 w-3" />
                {person.phone}
                {copied ? (
                  <Check className="h-3 w-3 text-live" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Property */}
        <section>
          <SectionLabel icon={<MapPin className="h-3.5 w-3.5" />}>Property</SectionLabel>
          <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
            <div className="text-sm font-semibold text-gray-100">{property.address}</div>
            <div className="mt-0.5 font-mono text-xs text-ink-500">Unit {property.unit}</div>
            {coResidents.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
                <Users className="h-3.5 w-3.5 text-ink-500" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Also here
                </span>
                {coResidents.map(r => (
                  <span
                    key={r.id}
                    className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-gray-300"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Open issues */}
        <section>
          <SectionLabel icon={<CircleAlert className="h-3.5 w-3.5 text-warn" />}>
            Open Issues
            <span className="ml-1.5 tnum rounded-full bg-warn/15 px-1.5 text-[10px] text-warn">
              {openIssues.length}
            </span>
          </SectionLabel>
          {openIssues.length === 0 ? (
            <p className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-sm text-ink-500">
              No open issues on this property. ✓
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {openIssues.map(issue => (
                <li
                  key={issue.id}
                  className="group flex items-center gap-3 rounded-xl border border-alert/20 bg-alert/[0.06] px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-100">{issue.description}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-alert/70">
                      {timeAgo(issue.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(issue)}
                    disabled={resolvingId === issue.id}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-live/30 bg-live/10 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-live transition-colors hover:bg-live/20 disabled:opacity-50"
                  >
                    {resolvingId === issue.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Resolve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Note */}
        <section>
          <SectionLabel icon={<ClipboardCheck className="h-3.5 w-3.5" />}>Call Note</SectionLabel>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What did the caller need? Notes save with the call log…"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-sm text-gray-100 placeholder:text-ink-500 outline-none transition-colors focus:border-signal/50 focus:bg-white/[0.04]"
          />
        </section>
      </div>

      {/* Footer actions */}
      <div className="flex shrink-0 gap-3 border-t border-white/8 bg-ink-900/40 px-6 py-4">
        <button
          onClick={handleLog}
          disabled={logging}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-signal to-signal-deep py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {logging ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
          Log Call
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.07]"
        >
          <PhoneOff className="h-4 w-4" />
          End
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
      {icon}
      {children}
    </div>
  )
}
