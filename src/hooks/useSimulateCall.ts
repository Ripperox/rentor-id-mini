import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CallerContext, Person, Property } from '../types'

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

      const { data: issues, error: e3 } = await supabase
        .from('issues')
        .select('*')
        .eq('property_id', property.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (e3) throw e3

      return { person, property, issues: issues ?? [] }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caller')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logNote = useCallback(async (ctx: CallerContext): Promise<void> => {
    const { error } = await supabase.from('call_logs').insert({
      person_id: ctx.person.id,
      property_id: ctx.property.id,
    })
    if (error) throw error
  }, [])

  return { call, logNote, loading, error }
}
