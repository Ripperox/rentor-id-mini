import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CallerContext, Person, Property, Issue } from '../types'

/**
 * Drives the incoming-call simulation: picks a random caller, resolves their
 * property, co-residents and open issues, and exposes the write actions an
 * agent performs from the caller card (resolve an issue, log the call).
 */
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

      let property: Property
      if (person.role === 'owner') {
        const { data, error: e2 } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', person.id)
          .limit(1)
          .single()
        if (e2) throw e2
        property = data as Property
      } else {
        const { data, error: e2 } = await supabase
          .from('tenancies')
          .select('property_id, properties(*)')
          .eq('person_id', person.id)
          .limit(1)
          .single()
        if (e2) throw e2
        property = (data as unknown as { properties: Property }).properties
      }

      const { data: residentRows, error: e3 } = await supabase
        .from('tenancies')
        .select('people(*)')
        .eq('property_id', property.id)
      if (e3) throw e3
      const coResidents = ((residentRows ?? []) as unknown as { people: Person }[])
        .map(r => r.people)
        .filter(p => p && p.id !== person.id)

      const { data: issues, error: e4 } = await supabase
        .from('issues')
        .select('*')
        .eq('property_id', property.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (e4) throw e4

      return { person, property, coResidents, issues: (issues ?? []) as Issue[] }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caller')
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

  const logNote = useCallback(
    async (ctx: CallerContext, note: string, agentName: string): Promise<void> => {
      const { error: e } = await supabase.from('call_logs').insert({
        person_id: ctx.person.id,
        property_id: ctx.property.id,
        note: note.trim() || null,
        agent_name: agentName,
      })
      if (e) throw e
    },
    [],
  )

  return { call, resolveIssue, logNote, loading, error }
}
