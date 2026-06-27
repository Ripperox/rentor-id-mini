import { Building2, Users, Wrench, PhoneCall } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DeskStats } from '../types'

interface Props {
  stats: DeskStats | null
}

interface Stat {
  key: keyof DeskStats
  label: string
  icon: LucideIcon
  accent: string
}

const STATS: Stat[] = [
  { key: 'properties', label: 'Properties', icon: Building2, accent: 'text-signal-soft' },
  { key: 'tenants', label: 'Tenants', icon: Users, accent: 'text-live' },
  { key: 'openIssues', label: 'Open Issues', icon: Wrench, accent: 'text-warn' },
  { key: 'callsToday', label: 'Calls Today', icon: PhoneCall, accent: 'text-signal-soft' },
]

export function StatsRow({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className="surface surface-hover animate-fade-up rounded-xl p-4 shadow-card transition-colors"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {stat.label}
              </span>
              <Icon className={`h-4 w-4 ${stat.accent}`} strokeWidth={2} />
            </div>
            <div className="mt-3 tnum font-display text-3xl font-extrabold text-white">
              {stats ? (
                stats[stat.key]
              ) : (
                <span className="inline-block h-7 w-10 animate-pulse-soft rounded bg-ink-700" />
              )}
            </div>
            {stat.key === 'openIssues' && stats && stats.emergencies > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-alert" />
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-alert">
                  {stats.emergencies} emergency
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
