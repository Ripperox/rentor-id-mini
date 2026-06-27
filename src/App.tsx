import { useState, useCallback } from 'react'
import { Background } from './components/Background'
import { TopBar } from './components/TopBar'
import { StatsRow } from './components/StatsRow'
import { SimulateButton } from './components/SimulateButton'
import { IncomingCall } from './components/IncomingCall'
import { CallHistory } from './components/CallHistory'
import { Toast } from './components/Toast'
import { useSimulateCall } from './hooks/useSimulateCall'
import { useDeskStats } from './hooks/useDeskStats'
import { useCallHistory } from './hooks/useCallHistory'
import type { CallerContext } from './types'

const AGENT_NAME = 'Rishit Dhote'

type ToastState = { message: string; type: 'success' | 'error' }

export default function App() {
  const [incoming, setIncoming] = useState<CallerContext | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const { call, resolveIssue, logNote, loading, error } = useSimulateCall()
  const { stats, refresh: refreshStats } = useDeskStats()
  const { entries, loading: historyLoading, refresh: refreshHistory } = useCallHistory()

  const handleSimulate = useCallback(async () => {
    const ctx = await call()
    if (ctx) setIncoming(ctx)
  }, [call])

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

  const handleLogCall = useCallback(
    async (note: string) => {
      if (!incoming) return
      try {
        await logNote(incoming, note, AGENT_NAME)
        await refreshHistory()
        void refreshStats()
        setToast({ message: 'Call logged successfully', type: 'success' })
        setIncoming(null)
      } catch {
        setToast({ message: 'Failed to log call — check connection', type: 'error' })
      }
    },
    [incoming, logNote, refreshHistory, refreshStats],
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
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              Operations Desk
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Real-time caller identification · <span className="text-gray-400">{today}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
            {error}
          </div>
        )}

        <StatsRow stats={stats} />

        <div className="mt-6">
          <CallHistory entries={entries} loading={historyLoading} />
        </div>
      </main>

      <SimulateButton onClick={handleSimulate} loading={loading} />

      {incoming && (
        <IncomingCall
          context={incoming}
          onResolveIssue={handleResolveIssue}
          onLogCall={handleLogCall}
          onClose={() => setIncoming(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
