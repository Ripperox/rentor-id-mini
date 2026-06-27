import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DeskStats } from '../types'

/** Live KPI counts for the dashboard header. Exposes refresh() for after a call is logged. */
export function useDeskStats() {
  const [stats, setStats] = useState<DeskStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [properties, tenants, openIssues, callsToday] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('people').select('*', { count: 'exact', head: true }).eq('role', 'tenant'),
        supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase
          .from('call_logs')
          .select('*', { count: 'exact', head: true })
          .gte('logged_at', startOfDay.toISOString()),
      ])

      const firstError = [properties, tenants, openIssues, callsToday].find(r => r.error)?.error
      if (firstError) throw firstError

      setStats({
        properties: properties.count ?? 0,
        tenants: tenants.count ?? 0,
        openIssues: openIssues.count ?? 0,
        callsToday: callsToday.count ?? 0,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { stats, error, refresh }
}
