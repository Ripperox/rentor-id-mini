import { useState, useEffect } from 'react'
import {
  Phone,
  MapPin,
  Copy,
  Check,
  Users,
  ClipboardCheck,
  PhoneOff,
  Loader2,
  Plus,
  CalendarClock,
  DollarSign,
  Building2,
  ShieldAlert,
  Bell,
  BellRing,
  CircleAlert,
  UserCircle2,
} from 'lucide-react'
import type { CallerContext, Issue, CallReason, CallerMode, IssueCategory, Priority } from '../types'
import { IssueItem } from './IssueItem'
import { NewIssueForm } from './NewIssueForm'
import { RENT_META } from '../lib/issueMeta'
import { money, monthYear } from '../lib/format'

interface Props {
  context: CallerContext
  mode: CallerMode
  onResolveIssue: (issueId: string) => Promise<void>
  onCreateIssue: (
    propertyId: string,
    input: { description: string; category: IssueCategory; priority: Priority },
  ) => Promise<Issue>
  onLogCall: (disposition: { note: string; reason: CallReason; followUp: boolean }) => Promise<void>
  onClose: () => void
}

const REASONS: { value: CallReason; label: string }[] = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'payment', label: 'Payment' },
  { value: 'lease', label: 'Lease' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'general', label: 'General' },
]

function initialsOf(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function CallerCard({ context, mode, onResolveIssue, onCreateIssue, onLogCall, onClose }: Props) {
  const { person, property, coResidents, lease, ownerContact, portfolioCount } = context
  const [issues, setIssues] = useState<Issue[]>(context.issues)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [showNewIssue, setShowNewIssue] = useState(false)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState<CallReason>(context.issues.length > 0 ? 'maintenance' : 'general')
  const [followUp, setFollowUp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logging, setLogging] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (mode !== 'call') return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [mode])

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
      /* parent toast */
    } finally {
      setResolvingId(null)
    }
  }

  const handleCreate = async (input: { description: string; category: IssueCategory; priority: Priority }) => {
    try {
      const created = await onCreateIssue(property.id, input)
      setIssues(prev => [created, ...prev])
      setShowNewIssue(false)
      if (reason === 'general') setReason('maintenance')
    } catch {
      /* parent surfaces the error toast; keep the form open to retry */
    }
  }

  const handleLog = async () => {
    setLogging(true)
    try {
      await onLogCall({ note, reason, followUp })
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="surface animate-scale-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-glow">
      {/* Header */}
      <div className="relative shrink-0 border-b border-white/8 bg-white/[0.02] px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-signal-soft">
          {mode === 'call' ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
              </span>
              Connected
              <span className="ml-auto tnum rounded bg-white/5 px-1.5 py-0.5 text-gray-400">{duration}</span>
            </>
          ) : (
            <>
              <UserCircle2 className="h-3.5 w-3.5" />
              Directory profile
            </>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-signal/90 text-base font-bold text-ink-950">
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

      {/* Body */}
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
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Also here</span>
                {coResidents.map(r => (
                  <span key={r.id} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-gray-300">
                    {r.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lease & rent (tenant) or portfolio (owner) */}
        {!isOwner && lease ? (
          <section>
            <SectionLabel icon={<DollarSign className="h-3.5 w-3.5" />}>Lease &amp; Rent</SectionLabel>
            <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${RENT_META[lease.rent_status].chip}`}
                >
                  {RENT_META[lease.rent_status].label}
                </span>
                <span className="tnum text-sm font-semibold text-gray-100">{money(lease.rent_cents)}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Lease ends {monthYear(lease.lease_end)}
              </div>
              {ownerContact && (
                <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
                  <ShieldAlert className="h-3.5 w-3.5 text-warn" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Escalate to owner</span>
                  <span className="ml-auto text-xs text-gray-300">{ownerContact.name}</span>
                  <span className="font-mono text-[11px] text-ink-500">{ownerContact.phone}</span>
                </div>
              )}
            </div>
          </section>
        ) : isOwner ? (
          <section>
            <SectionLabel icon={<Building2 className="h-3.5 w-3.5" />}>Portfolio</SectionLabel>
            <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-sm text-gray-200">
              Owns <span className="font-semibold text-white">{portfolioCount}</span>{' '}
              {portfolioCount === 1 ? 'property' : 'properties'} · viewing{' '}
              <span className="text-gray-300">{property.address}</span>
            </div>
          </section>
        ) : null}

        {/* Open issues */}
        <section>
          <div className="flex items-center justify-between">
            <SectionLabel icon={<CircleAlert className="h-3.5 w-3.5 text-warn" />}>
              Open Issues
              <span className="ml-1.5 tnum rounded-full bg-warn/15 px-1.5 text-[10px] text-warn">{openIssues.length}</span>
            </SectionLabel>
            {!showNewIssue && (
              <button
                onClick={() => setShowNewIssue(true)}
                className="flex items-center gap-1 rounded-lg border border-signal/30 bg-signal/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-signal-soft transition-colors hover:bg-signal/20"
              >
                <Plus className="h-3 w-3" />
                Report
              </button>
            )}
          </div>

          <div className="mt-2 space-y-2">
            {showNewIssue && <NewIssueForm onSubmit={handleCreate} onCancel={() => setShowNewIssue(false)} />}
            {openIssues.length === 0 && !showNewIssue ? (
              <p className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-sm text-ink-500">
                No open issues on this property. ✓
              </p>
            ) : (
              <ul className="space-y-2">
                {openIssues.map(issue => (
                  <IssueItem
                    key={issue.id}
                    issue={issue}
                    resolving={resolvingId === issue.id}
                    onResolve={handleResolve}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Disposition */}
        <section>
          <SectionLabel icon={<ClipboardCheck className="h-3.5 w-3.5" />}>Call Disposition</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASONS.map(r => {
              const active = reason === r.value
              return (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    active
                      ? 'border-signal/50 bg-signal/20 text-signal-soft'
                      : 'border-white/8 bg-white/[0.02] text-ink-500 hover:text-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What did the caller need? Notes save with the call log…"
            rows={2}
            className="mt-2 w-full resize-none rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-sm text-gray-100 placeholder:text-ink-500 outline-none transition-colors focus:border-signal/50 focus:bg-white/[0.04]"
          />
          <button
            onClick={() => setFollowUp(f => !f)}
            className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              followUp
                ? 'border-signal/50 bg-signal/15 text-signal-soft'
                : 'border-white/8 bg-white/[0.02] text-ink-500 hover:text-gray-300'
            }`}
          >
            {followUp ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            {followUp ? 'Flagged for follow-up' : 'Flag for follow-up'}
          </button>
        </section>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 gap-3 border-t border-white/8 bg-ink-900/40 px-6 py-4">
        <button
          onClick={handleLog}
          disabled={logging}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-signal py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-signal-soft disabled:opacity-60"
        >
          {logging ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
          {mode === 'call' ? 'Log Call' : 'Log Contact'}
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.07]"
        >
          {mode === 'call' ? <PhoneOff className="h-4 w-4" /> : null}
          {mode === 'call' ? 'End' : 'Close'}
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
