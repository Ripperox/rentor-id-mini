import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSimulateCall } from './useSimulateCall'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../lib/supabase'

const mockOwner = { id: 'owner-1', name: 'Marcus Williams', phone: '+1-707-555-0101', role: 'owner' }
const mockTenant = { id: 'tenant-9', name: 'Sarah Johnson', phone: '+1-707-555-0201', role: 'tenant' }
const mockProperty = { id: 'prop-1', address: '3109 H St', unit: '1A', owner_id: 'owner-1' }
const mockIssues = [
  {
    id: 'issue-1',
    property_id: 'prop-1',
    description: 'Leaking pipe',
    status: 'open',
    created_at: '2026-06-24T10:00:00Z',
    resolved_at: null,
  },
]

function makePeopleChain(people: unknown[]) {
  return { select: vi.fn().mockResolvedValue({ data: people, error: null }) }
}

function makePropertiesChain(property: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: property, error: null }),
  }
}

// tenancies.select('people(*)').eq('property_id', …) resolves at .eq()
function makeResidentsChain(rows: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
}

function makeIssuesChain(issues: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: issues, error: null }),
  }
}

describe('useSimulateCall', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns caller context with co-residents (excluding the caller) and open issues', async () => {
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom
      .mockReturnValueOnce(makePeopleChain([mockOwner]))
      .mockReturnValueOnce(makePropertiesChain(mockProperty))
      .mockReturnValueOnce(makeResidentsChain([{ people: mockTenant }, { people: mockOwner }]))
      .mockReturnValueOnce(makeIssuesChain(mockIssues))

    const { result } = renderHook(() => useSimulateCall())

    let context: Awaited<ReturnType<typeof result.current.call>> = null
    await act(async () => {
      context = await result.current.call()
    })

    expect(context).toEqual({
      person: mockOwner,
      property: mockProperty,
      coResidents: [mockTenant], // owner self filtered out
      issues: mockIssues,
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolveIssue updates the issue to resolved with a timestamp', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const { result } = renderHook(() => useSimulateCall())
    await act(async () => {
      await result.current.resolveIssue('issue-1')
    })

    expect(supabase.from).toHaveBeenCalledWith('issues')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'resolved', resolved_at: expect.any(String) }),
    )
    expect(chain.eq).toHaveBeenCalledWith('id', 'issue-1')
  })

  it('logNote inserts a call log with trimmed note and agent name', async () => {
    const chain = { insert: vi.fn().mockResolvedValue({ error: null }) }
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const ctx = { person: mockOwner, property: mockProperty, coResidents: [], issues: [] }
    const { result } = renderHook(() => useSimulateCall())
    await act(async () => {
      await result.current.logNote(ctx as never, '  needs follow-up  ', 'Rishit Dhote')
    })

    expect(supabase.from).toHaveBeenCalledWith('call_logs')
    expect(chain.insert).toHaveBeenCalledWith({
      person_id: 'owner-1',
      property_id: 'prop-1',
      note: 'needs follow-up',
      agent_name: 'Rishit Dhote',
    })
  })
})
