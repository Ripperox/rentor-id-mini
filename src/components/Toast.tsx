import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface Props {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const border = type === 'success' ? 'border-green-700 bg-green-900/50' : 'border-red-700 bg-red-900/50'

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 border rounded-lg shadow-xl px-4 py-3 ${border}`}>
      {type === 'success'
        ? <CheckCircle className="text-green-400 w-5 h-5 shrink-0" />
        : <XCircle className="text-red-400 w-5 h-5 shrink-0" />}
      <span className="text-gray-100 text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
