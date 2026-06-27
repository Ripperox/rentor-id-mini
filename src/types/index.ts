export type Role = 'tenant' | 'owner'
export type IssueStatus = 'open' | 'resolved'

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
  created_at: string
  resolved_at: string | null
}

export interface CallLog {
  id: string
  person_id: string
  property_id: string
  logged_at: string
  note: string | null
  agent_name: string | null
}

/** Resolved context shown on the caller card when a call is answered. */
export interface CallerContext {
  person: Person
  property: Property
  /** Everyone else living at the same property (excludes the caller). */
  coResidents: Person[]
  issues: Issue[]
}

/** A persisted call row joined with its person + property, for the history feed. */
export interface CallHistoryEntry {
  id: string
  logged_at: string
  note: string | null
  agent_name: string | null
  person: Pick<Person, 'name' | 'role' | 'phone'> | null
  property: Pick<Property, 'address' | 'unit'> | null
}

/** Live KPI counts for the dashboard header. */
export interface DeskStats {
  properties: number
  tenants: number
  openIssues: number
  callsToday: number
}
