import { useState } from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import type { CallerContext } from '../types'
import { CallerCard } from './CallerCard'

interface Props {
  context: CallerContext
  onResolveIssue: (issueId: string) => Promise<void>
  onLogCall: (note: string) => Promise<void>
  onClose: () => void
}

/**
 * Full-screen incoming-call experience. Rings first (caller identity withheld),
 * then on Answer reveals the full {@link CallerCard}. Decline dismisses.
 */
export function IncomingCall({ context, onResolveIssue, onLogCall, onClose }: Props) {
  const [answered, setAnswered] = useState(false)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {answered ? (
        <CallerCard
          context={context}
          onResolveIssue={onResolveIssue}
          onLogCall={onLogCall}
          onClose={onClose}
        />
      ) : (
        <div className="surface animate-scale-in w-full max-w-sm rounded-2xl px-8 py-10 text-center shadow-glow">
          <div className="relative mx-auto grid h-24 w-24 place-items-center">
            <span className="absolute inline-flex h-20 w-20 animate-ring rounded-full bg-signal/40" />
            <span
              className="absolute inline-flex h-20 w-20 animate-ring rounded-full bg-signal/30"
              style={{ animationDelay: '0.6s' }}
            />
            <span
              className="absolute inline-flex h-20 w-20 animate-ring rounded-full bg-signal/20"
              style={{ animationDelay: '1.2s' }}
            />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-signal to-signal-deep shadow-glow">
              <Phone className="h-8 w-8 text-white" strokeWidth={2.2} />
            </span>
          </div>

          <div className="mt-7 font-mono text-[11px] uppercase tracking-[0.28em] text-signal-soft animate-pulse-soft">
            Incoming Call
          </div>
          <div className="mt-2 tnum font-display text-2xl font-extrabold text-white">
            {context.person.phone}
          </div>
          <div className="mt-1 text-xs text-ink-500">Property management line · Answer to identify</div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={onClose}
              className="group flex flex-col items-center gap-2"
              aria-label="Decline call"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-alert/90 text-white shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
                <PhoneOff className="h-6 w-6" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Decline
              </span>
            </button>
            <button
              onClick={() => setAnswered(true)}
              className="group flex flex-col items-center gap-2"
              aria-label="Answer call"
            >
              <span className="relative grid h-14 w-14 place-items-center rounded-full bg-live text-ink-950 shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
                <span className="absolute inline-flex h-14 w-14 animate-ping rounded-full bg-live opacity-40" />
                <Phone className="relative h-6 w-6" strokeWidth={2.4} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-live">Answer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
