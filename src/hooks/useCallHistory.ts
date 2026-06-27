import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { CallHistoryEntry } from '../types'

const SELECT =
  'id, person_id, logged_at, note, agent_name, reason, follow_up, people(name, role, phone), properties(address, unit)'

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
        person_id: string
        logged_at: string
        note: string | null
        agent_name: string | null
        reason: CallHistoryEntry['reason']
        follow_up: boolean
        people: CallHistoryEntry['person']
        properties: CallHistoryEntry['property']
      }>

      setEntries(
        rows.map(r => ({
          id: r.id,
          person_id: r.person_id,
          logged_at: r.logged_at,
          note: r.note,
          agent_name: r.agent_name,
          reason: r.reason,
          follow_up: r.follow_up,
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

  /** Clear a follow-up flag once the agent has called the person back. */
  const clearFollowUp = useCallback(async (id: string) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, follow_up: false } : e)))
    const { error: e } = await supabase.from('call_logs').update({ follow_up: false }).eq('id', id)
    if (e) await refresh() // revert optimistic update on failure
  }, [refresh])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const followUps = useMemo(() => entries.filter(e => e.follow_up), [entries])

  return { entries, followUps, loading, error, refresh, clearFollowUp }
}
