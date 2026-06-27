import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type {
  CallerContext,
  Person,
  Property,
  Issue,
  Lease,
  CallDisposition,
  IssueCategory,
  Priority,
} from '../types'

const PRIORITY_WEIGHT: Record<Priority, number> = { emergency: 0, urgent: 1, routine: 2 }

/** Open issues first by priority, then most-recent first. */
function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort(
    (a, b) =>
      PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
      b.created_at.localeCompare(a.created_at),
  )
}

async function fetchOpenIssues(propertyId: string): Promise<Issue[]> {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return sortIssues((data ?? []) as Issue[])
}

async function fetchCoResidents(propertyId: string, callerId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from('tenancies')
    .select('people(*)')
    .eq('property_id', propertyId)
  if (error) throw error
  return ((data ?? []) as unknown as { people: Person }[])
    .map(r => r.people)
    .filter(p => p && p.id !== callerId)
}

/** Resolve a caller (tenant or owner) into the full context shown on the card. */
async function buildContext(person: Person): Promise<CallerContext> {
  if (person.role === 'owner') {
    const { data: prop, error: e1 } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', person.id)
      .limit(1)
      .single()
    if (e1) throw e1
    const property = prop as Property

    const { count, error: e2 } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', person.id)
    if (e2) throw e2

    const [coResidents, issues] = await Promise.all([
      fetchCoResidents(property.id, person.id),
      fetchOpenIssues(property.id),
    ])

    return {
      person,
      property,
      coResidents,
      issues,
      lease: null,
      ownerContact: null,
      portfolioCount: count ?? 0,
    }
  }

  // Tenant path
  const { data: tenancy, error: e1 } = await supabase
    .from('tenancies')
    .select('lease_start, lease_end, rent_cents, rent_status, properties(*)')
    .eq('person_id', person.id)
    .limit(1)
    .single()
  if (e1) throw e1
  const row = tenancy as unknown as Lease & { properties: Property }
  const property = row.properties
  const lease: Lease = {
    lease_start: row.lease_start,
    lease_end: row.lease_end,
    rent_cents: row.rent_cents,
    rent_status: row.rent_status,
  }

  const { data: owner } = await supabase
    .from('people')
    .select('*')
    .eq('id', property.owner_id)
    .maybeSingle()

  const [coResidents, issues] = await Promise.all([
    fetchCoResidents(property.id, person.id),
    fetchOpenIssues(property.id),
  ])

  return {
    person,
    property,
    coResidents,
    issues,
    lease,
    ownerContact: (owner as Person | null) ?? null,
    portfolioCount: null,
  }
}

export function useSimulateCall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async (): Promise<CallerContext | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data: people, error: e1 } = await supabase.from('people').select('*')
      if (e1) throw e1
      if (!people || people.length === 0) throw new Error('No people in database')
      const person = people[Math.floor(Math.random() * people.length)] as Person
      return await buildContext(person)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caller')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /** Open a specific person's card from the directory (no incoming call). */
  const lookup = useCallback(async (personId: string): Promise<CallerContext | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data: person, error: e1 } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .single()
      if (e1) throw e1
      return await buildContext(person as Person)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const resolveIssue = useCallback(async (issueId: string): Promise<void> => {
    const { error: e } = await supabase
      .from('issues')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', issueId)
    if (e) throw e
  }, [])

  const createIssue = useCallback(
    async (
      propertyId: string,
      input: { description: string; category: IssueCategory; priority: Priority },
    ): Promise<Issue> => {
      const { data, error: e } = await supabase
        .from('issues')
        .insert({
          property_id: propertyId,
          description: input.description.trim(),
          category: input.category,
          priority: input.priority,
          status: 'open',
        })
        .select('*')
        .single()
      if (e) throw e
      return data as Issue
    },
    [],
  )

  const logCall = useCallback(
    async (ctx: CallerContext, disposition: CallDisposition, agentName: string): Promise<void> => {
      const { error: e } = await supabase.from('call_logs').insert({
        person_id: ctx.person.id,
        property_id: ctx.property.id,
        note: disposition.note.trim() || null,
        reason: disposition.reason,
        follow_up: disposition.followUp,
        agent_name: agentName,
      })
      if (e) throw e
    },
    [],
  )

  return { call, lookup, resolveIssue, createIssue, logCall, loading, error }
}
