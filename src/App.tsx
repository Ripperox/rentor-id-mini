import { useState, useCallback, useEffect } from 'react'
import { Command } from 'lucide-react'
import { Background } from './components/Background'
import { TopBar } from './components/TopBar'
import { StatsRow } from './components/StatsRow'
import { SimulateButton } from './components/SimulateButton'
import { IncomingCall } from './components/IncomingCall'
import { CallerCard } from './components/CallerCard'
import { CallHistory } from './components/CallHistory'
import { FollowUpsPanel } from './components/FollowUpsPanel'
import { CommandPalette } from './components/CommandPalette'
import { Toast } from './components/Toast'
import { useSimulateCall } from './hooks/useSimulateCall'
import { useDeskStats } from './hooks/useDeskStats'
import { useCallHistory } from './hooks/useCallHistory'
import { useDirectory } from './hooks/useDirectory'
import type { CallerContext, CallReason, IssueCategory, Priority } from './types'

const AGENT_NAME = 'Rishit Dhote'

type ToastState = { message: string; type: 'success' | 'error' }

export default function App() {
  const [incoming, setIncoming] = useState<CallerContext | null>(null)
  const [profile, setProfile] = useState<CallerContext | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const { call, lookup, resolveIssue, createIssue, logCall, loading, error } = useSimulateCall()
  const { stats, refresh: refreshStats } = useDeskStats()
  const { entries, followUps, loading: historyLoading, refresh: refreshHistory, clearFollowUp } =
    useCallHistory()
  const { search } = useDirectory()

  // ⌘K / Ctrl-K toggles the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSimulate = useCallback(async () => {
    setPaletteOpen(false)
    const ctx = await call()
    if (ctx) setIncoming(ctx)
  }, [call])

  const openProfile = useCallback(
    async (personId: string) => {
      setPaletteOpen(false)
      const ctx = await lookup(personId)
      if (ctx) setProfile(ctx)
    },
    [lookup],
  )

  const handleResolveIssue = useCallback(
    async (issueId: string) => {
      try {
        await resolveIssue(issueId)
        void refreshStats()
        setToast({ message: 'Issue marked resolved', type: 'success' })
      } catch {
        setToast({ message: 'Could not resolve issue — check connection', type: 'error' })
        throw new Error('resolve failed')
      }
    },
    [resolveIssue, refreshStats],
  )

  const handleCreateIssue = useCallback(
    async (
      propertyId: string,
      input: { description: string; category: IssueCategory; priority: Priority },
    ) => {
      try {
        const issue = await createIssue(propertyId, input)
        void refreshStats()
        setToast({ message: 'New issue logged', type: 'success' })
        return issue
      } catch (e) {
        setToast({ message: 'Could not log issue — check connection', type: 'error' })
        throw e
      }
    },
    [createIssue, refreshStats],
  )

  const handleLogCall = useCallback(
    async (disposition: { note: string; reason: CallReason; followUp: boolean }) => {
      const ctx = incoming ?? profile
      if (!ctx) return
      try {
        await logCall(ctx, disposition, AGENT_NAME)
        await refreshHistory()
        void refreshStats()
        setToast({ message: 'Call logged successfully', type: 'success' })
        setIncoming(null)
        setProfile(null)
      } catch {
        setToast({ message: 'Failed to log call — check connection', type: 'error' })
      }
    },
    [incoming, profile, logCall, refreshHistory, refreshStats],
  )

  const handleClearFollowUp = useCallback(
    async (id: string) => {
      await clearFollowUp(id)
      setToast({ message: 'Follow-up cleared', type: 'success' })
    },
    [clearFollowUp],
  )

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="relative min-h-screen">
      <Background />
      <TopBar agentName={AGENT_NAME} />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              Operations Desk
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Real-time caller identification · <span className="text-gray-400">{today}</span>
            </p>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-500 transition-colors hover:border-signal/30 hover:text-gray-300"
          >
            <Command className="h-3.5 w-3.5" />
            Search directory
            <kbd className="ml-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
            {error}
          </div>
        )}

        <StatsRow stats={stats} />

        <div className="mt-6 space-y-6">
          <FollowUpsPanel
            followUps={followUps}
            onCallBack={openProfile}
            onClear={handleClearFollowUp}
          />
          <CallHistory entries={entries} loading={historyLoading} />
        </div>
      </main>

      <SimulateButton onClick={handleSimulate} loading={loading} />

      {incoming && (
        <IncomingCall
          context={incoming}
          onResolveIssue={handleResolveIssue}
          onCreateIssue={handleCreateIssue}
          onLogCall={handleLogCall}
          onClose={() => setIncoming(null)}
        />
      )}

      {profile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <CallerCard
            context={profile}
            mode="profile"
            onResolveIssue={handleResolveIssue}
            onCreateIssue={handleCreateIssue}
            onLogCall={handleLogCall}
            onClose={() => setProfile(null)}
          />
        </div>
      )}

      {paletteOpen && (
        <CommandPalette
          search={search}
          onPickPerson={openProfile}
          onSimulate={handleSimulate}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
