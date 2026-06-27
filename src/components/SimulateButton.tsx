import { PhoneIncoming, Loader2 } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
}

export function SimulateButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group fixed bottom-8 right-8 z-30 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-signal to-signal-deep px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <PhoneIncoming className="h-4 w-4 transition-transform group-hover:-rotate-12" />
      )}
      {loading ? 'Connecting…' : 'Simulate Incoming Call'}
    </button>
  )
}
