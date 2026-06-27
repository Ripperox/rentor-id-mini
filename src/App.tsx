import { useState, useCallback } from 'react'
import { NavBar } from './components/NavBar'
import { SimulateButton } from './components/SimulateButton'
import { CallerModal } from './components/CallerModal'
import { CallLogTable } from './components/CallLogTable'
import { Toast } from './components/Toast'
import { useSimulateCall } from './hooks/useSimulateCall'
import type { CallerContext, CallEntry } from './types'

export default function App() {
  const [modal, setModal] = useState<CallerContext | null>(null)
  const [callLog, setCallLog] = useState<CallEntry[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const { call, logNote, loading, error } = useSimulateCall()

  const handleSimulate = useCallback(async () => {
    const context = await call()
    if (context) {
      setModal(context)
    }
  }, [call])

  const handleLogNote = useCallback(async () => {
    if (!modal) return
    try {
      await logNote(modal)
      setCallLog(prev => [{
        id: crypto.randomUUID(),
        person: modal.person,
        property: modal.property,
        timestamp: new Date(),
      }, ...prev])
      setToast({ message: 'Call logged successfully', type: 'success' })
      setModal(null)
    } catch {
      setToast({ message: 'Failed to log call — check connection', type: 'error' })
    }
  }, [modal, logNote])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <NavBar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Call Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time caller identification dashboard</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <CallLogTable entries={callLog} />
      </main>

      <SimulateButton onClick={handleSimulate} loading={loading} />

      {modal && (
        <CallerModal
          context={modal}
          onLogNote={handleLogNote}
          onDismiss={() => setModal(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
