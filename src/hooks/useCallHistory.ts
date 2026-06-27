import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CallHistoryEntry } from '../types'

const SELECT = 'id, logged_at, note, agent_name, people(name, role, phone), properties(address, unit)'

/** Loads persisted call history (joined with person + property) so the feed survives a refresh. */
export function useCallHistory() {
  const [entries, setEntries] = useState<CallHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const { data, error: e } = await supabase
        .from('call_logs')
        .select(SELECT)
        .order('logged_at', { ascending: false })
        .limit(50)
      if (e) throw e

      const rows = (data ?? []) as unknown as Array<{
        id: string
        logged_at: string
        note: string | null
        agent_name: string | null
        people: CallHistoryEntry['person']
        properties: CallHistoryEntry['property']
      }>

      setEntries(
        rows.map(r => ({
          id: r.id,
          logged_at: r.logged_at,
          note: r.note,
          agent_name: r.agent_name,
          person: r.people,
          property: r.properties,
        })),
      )
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { entries, loading, error, refresh }
}
