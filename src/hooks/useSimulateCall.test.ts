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
    priority: 'emergency',
    category: 'plumbing',
    created_at: '2026-06-24T10:00:00Z',
    resolved_at: null,
  },
]

const peopleChain = (people: unknown[]) => ({
  select: vi.fn().mockResolvedValue({ data: people, error: null }),
})
const singleChain = (row: unknown) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: row, error: null }),
})
const countChain = (count: number) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ count, error: null }),
})
const residentsChain = (rows: unknown[]) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
})
const issuesChain = (issues: unknown[]) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: issues, error: null }),
})

describe('useSimulateCall', () => {
  beforeEach(() => vi.clearAllMocks())

  it('builds enriched owner context (portfolio count, co-residents, sorted issues)', async () => {
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom
      .mockReturnValueOnce(peopleChain([mockOwner])) // pick caller
      .mockReturnValueOnce(singleChain(mockProperty)) // owner's property
      .mockReturnValueOnce(countChain(3)) // portfolio count
      .mockReturnValueOnce(residentsChain([{ people: mockTenant }, { people: mockOwner }])) // co-residents
      .mockReturnValueOnce(issuesChain(mockIssues)) // open issues

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
      lease: null,
      ownerContact: null,
      portfolioCount: 3,
    })
    expect(result.current.error).toBeNull()
  })

  it('createIssue inserts an open issue and returns it', async () => {
    const newIssue = { ...mockIssues[0], id: 'issue-new', description: 'No hot water' }
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newIssue, error: null }),
    }
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const { result } = renderHook(() => useSimulateCall())
    let created
    await act(async () => {
      created = await result.current.createIssue('prop-1', {
        description: '  No hot water  ',
        category: 'plumbing',
        priority: 'urgent',
      })
    })

    expect(supabase.from).toHaveBeenCalledWith('issues')
    expect(chain.insert).toHaveBeenCalledWith({
      property_id: 'prop-1',
      description: 'No hot water',
      category: 'plumbing',
      priority: 'urgent',
      status: 'open',
    })
    expect(created).toEqual(newIssue)
  })

  it('resolveIssue marks the issue resolved with a timestamp', async () => {
    const chain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) }
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const { result } = renderHook(() => useSimulateCall())
    await act(async () => {
      await result.current.resolveIssue('issue-1')
    })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'resolved', resolved_at: expect.any(String) }),
    )
    expect(chain.eq).toHaveBeenCalledWith('id', 'issue-1')
  })

  it('logCall persists a structured disposition', async () => {
    const chain = { insert: vi.fn().mockResolvedValue({ error: null }) }
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const ctx = {
      person: mockOwner,
      property: mockProperty,
      coResidents: [],
      issues: [],
      lease: null,
      ownerContact: null,
      portfolioCount: 1,
    }
    const { result } = renderHook(() => useSimulateCall())
    await act(async () => {
      await result.current.logCall(
        ctx as never,
        { note: '  called about leak  ', reason: 'maintenance', followUp: true },
        'Rishit Dhote',
      )
    })

    expect(supabase.from).toHaveBeenCalledWith('call_logs')
    expect(chain.insert).toHaveBeenCalledWith({
      person_id: 'owner-1',
      property_id: 'prop-1',
      note: 'called about leak',
      reason: 'maintenance',
      follow_up: true,
      agent_name: 'Rishit Dhote',
    })
  })
})
