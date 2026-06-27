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
}

export interface CallLog {
  id: string
  person_id: string
  property_id: string
  logged_at: string
  note: string | null
}

export interface CallerContext {
  person: Person
  property: Property
  issues: Issue[]
}

export interface CallEntry {
  id: string
  person: Person
  property: Property
  timestamp: Date
}
