import { useEffect, useState } from 'react'
import { Phone, MapPin, AlertTriangle, X, ClipboardList } from 'lucide-react'
import type { CallerContext } from '../types'

interface Props {
  context: CallerContext
  onLogNote: () => void
  onDismiss: () => void
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function CallerModal({ context, onLogNote, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const { person, property, issues } = context

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const copyPhone = () => {
    navigator.clipboard.writeText(person.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-600/20 rounded-full p-3">
            <Phone className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Incoming Call</p>
            <h2 className="text-white font-bold text-xl leading-tight">{person.name}</h2>
          </div>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
              person.role === 'owner' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
            }`}
          >
            {person.role === 'owner' ? 'Owner' : 'Tenant'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="font-mono text-sm">{person.phone}</span>
          <button onClick={copyPhone} className="ml-auto text-gray-500 hover:text-gray-300 transition-colors text-xs">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex items-start gap-2 mb-5 text-gray-300">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{property.address}</p>
            <p className="text-xs text-gray-500">Unit {property.unit}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400 text-xs uppercase tracking-widest">Open Issues</span>
          </div>
          {issues.length === 0 ? (
            <p className="text-gray-600 text-sm italic pl-1">No open issues</p>
          ) : (
            <ul className="space-y-2">
              {issues.map(issue => (
                <li
                  key={issue.id}
                  className="flex items-start justify-between bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2"
                >
                  <span className="text-red-300 text-sm">{issue.description}</span>
                  <span className="text-red-600 text-xs ml-3 shrink-0">{timeAgo(issue.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onLogNote}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Log Note
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
