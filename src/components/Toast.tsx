import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

interface Props {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  const ok = type === 'success'

  return (
    <div className="fixed right-4 top-4 z-50 animate-fade-up">
      <div
        className={`surface flex items-center gap-3 rounded-xl px-4 py-3 shadow-glow ${
          ok ? 'border-live/30' : 'border-alert/30'
        }`}
      >
        {ok ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-live" />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0 text-alert" />
        )}
        <span className="text-sm text-gray-100">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-ink-500 transition-colors hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
