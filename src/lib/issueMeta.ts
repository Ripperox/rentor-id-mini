import { Droplets, Zap, Wind, Plug, Hammer, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Priority, IssueCategory, RentStatus } from '../types'

interface PriorityMeta {
  label: string
  text: string
  chip: string
  /** SLA: an open issue older than this many days is overdue. */
  slaDays: number
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  emergency: { label: 'Emergency', text: 'text-alert', chip: 'bg-alert/15 text-alert ring-1 ring-alert/30', slaDays: 1 },
  urgent: { label: 'Urgent', text: 'text-warn', chip: 'bg-warn/15 text-warn ring-1 ring-warn/30', slaDays: 3 },
  routine: { label: 'Routine', text: 'text-signal-soft', chip: 'bg-white/8 text-gray-300 ring-1 ring-white/10', slaDays: 14 },
}

export const PRIORITY_ORDER: Priority[] = ['emergency', 'urgent', 'routine']

interface CategoryMeta {
  label: string
  icon: LucideIcon
}

export const CATEGORY_META: Record<IssueCategory, CategoryMeta> = {
  plumbing: { label: 'Plumbing', icon: Droplets },
  electrical: { label: 'Electrical', icon: Zap },
  hvac: { label: 'HVAC', icon: Wind },
  appliance: { label: 'Appliance', icon: Plug },
  structural: { label: 'Structural', icon: Hammer },
  other: { label: 'Other', icon: Wrench },
}

export const CATEGORY_ORDER: IssueCategory[] = [
  'plumbing',
  'electrical',
  'hvac',
  'appliance',
  'structural',
  'other',
]

interface RentMeta {
  label: string
  chip: string
}

export const RENT_META: Record<RentStatus, RentMeta> = {
  paid: { label: 'Paid', chip: 'bg-live/15 text-live ring-1 ring-live/30' },
  late: { label: 'Late', chip: 'bg-warn/15 text-warn ring-1 ring-warn/30' },
  overdue: { label: 'Overdue', chip: 'bg-alert/15 text-alert ring-1 ring-alert/30' },
}
