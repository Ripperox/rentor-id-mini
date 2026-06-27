import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DirectoryResult, Person, Property } from '../types'

/**
 * Loads the full people + property directory once and filters in memory.
 * The dataset is small, so client-side search keeps the command palette instant.
 */
export function useDirectory() {
  const [people, setPeople] = useState<Person[]>([])
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    void (async () => {
      const [p, pr] = await Promise.all([
        supabase.from('people').select('*'),
        supabase.from('properties').select('*'),
      ])
      setPeople((p.data ?? []) as Person[])
      setProperties((pr.data ?? []) as Property[])
    })()
  }, [])

  const search = useCallback(
    (query: string): DirectoryResult[] => {
      const q = query.trim().toLowerCase()
      if (!q) return []
      const peopleHits: DirectoryResult[] = people
        .filter(p => p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q))
        .map(p => ({ kind: 'person', id: p.id, name: p.name, phone: p.phone, role: p.role }))
      const propertyHits: DirectoryResult[] = properties
        .filter(p => p.address.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q))
        .map(p => ({ kind: 'property', id: p.id, address: p.address, unit: p.unit }))
      return [...peopleHits, ...propertyHits].slice(0, 8)
    },
    [people, properties],
  )

  return { search, ready: people.length > 0 }
}
