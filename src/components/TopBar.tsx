import { Radio } from 'lucide-react'

interface Props {
  agentName: string
}

/** Console header: brand mark, live status, and the signed-in agent. */
export function TopBar({ agentName }: Props) {
  const initials = agentName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-signal/15 ring-1 ring-signal/30">
            <Radio className="h-[18px] w-[18px] text-signal-soft" strokeWidth={2.2} />
          </div>
          <div className="leading-none">
            <div className="font-display text-[17px] font-extrabold tracking-tight text-white">
              Rentor<span className="text-signal-soft">Desk</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
              Caller ID Console
            </div>
          </div>
        </div>

        <div className="ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-live">
            Live
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-[13px] font-semibold text-gray-200">{agentName}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Dispatch agent
            </div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-signal/90 text-[12px] font-bold text-ink-950">
            {initials}
          </div>
        </div>
      </div>
      <div className="hairline" />
    </header>
  )
}
