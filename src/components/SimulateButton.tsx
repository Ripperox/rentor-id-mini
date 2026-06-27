import { Phone } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
}

export function SimulateButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="fixed bottom-8 right-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-full shadow-lg shadow-blue-900/50 transition-colors"
    >
      <Phone className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
      {loading ? 'Connecting...' : 'Simulate Incoming Call'}
    </button>
  )
}
