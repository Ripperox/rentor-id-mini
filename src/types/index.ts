export type Role = 'tenant' | 'owner'
export type IssueStatus = 'open' | 'resolved'
export type Priority = 'emergency' | 'urgent' | 'routine'
export type IssueCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
export type RentStatus = 'paid' | 'late' | 'overdue'
export type CallReason = 'maintenance' | 'payment' | 'lease' | 'complaint' | 'general'

export interface Person {
  id: string
  name: string
  phone: string
  role: Role
}

export interface Property {
  id: string
  address: string
  unit: string
  owner_id: string
}

export interface Issue {
  id: string
  property_id: string
  description: string
  status: IssueStatus
  priority: Priority
  category: IssueCategory
  created_at: string
  resolved_at: string | null
}

/** Lease + rent context for a tenant at a specific property. */
export interface Lease {
  lease_start: string | null
  lease_end: string | null
  rent_cents: number | null
  rent_status: RentStatus
}

export interface CallLog {
  id: string
  person_id: string
  property_id: string
  logged_at: string
  note: string | null
  agent_name: string | null
  reason: CallReason | null
  follow_up: boolean
}

/** How the caller card was opened. */
export type CallerMode = 'call' | 'profile'

/** Resolved context shown on the caller card. */
export interface CallerContext {
  person: Person
  property: Property
  /** Everyone else living at the same property (excludes the caller). */
  coResidents: Person[]
  issues: Issue[]
  /** Tenant only: their lease + rent standing. */
  lease: Lease | null
  /** Tenant only: the property's owner, for escalation. */
  ownerContact: Person | null
  /** Owner only: how many properties they own. */
  portfolioCount: number | null
}

/** What an agent records when wrapping up a call. */
export interface CallDisposition {
  note: string
  reason: CallReason
  followUp: boolean
}

/** A persisted call row joined with its person + property, for the history feed. */
export interface CallHistoryEntry {
  id: string
  person_id: string
  logged_at: string
  note: string | null
  agent_name: string | null
  reason: CallReason | null
  follow_up: boolean
  person: Pick<Person, 'name' | 'role' | 'phone'> | null
  property: Pick<Property, 'address' | 'unit'> | null
}

/** Live KPI counts for the dashboard header. */
export interface DeskStats {
  properties: number
  tenants: number
  openIssues: number
  emergencies: number
  callsToday: number
}

/** A flat directory row for global search / the command palette. */
export type DirectoryResult =
  | { kind: 'person'; id: string; name: string; phone: string; role: Role }
  | { kind: 'property'; id: string; address: string; unit: string }
