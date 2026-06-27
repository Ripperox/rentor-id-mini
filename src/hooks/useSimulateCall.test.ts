import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSimulateCall } from './useSimulateCall'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../lib/supabase'

const mockOwner = { id: 'owner-1', name: 'Marcus Williams', phone: '+1-707-555-0101', role: 'owner' }
const mockProperty = { id: 'prop-1', address: '3109 H St', unit: '1A', owner_id: 'owner-1' }
const mockIssues = [
  { id: 'issue-1', property_id: 'prop-1', description: 'Leaking pipe', status: 'open', created_at: '2026-06-24T10:00:00Z' },
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

function makeIssuesChain(issues: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: issues, error: null }),
  }
}

describe('useSimulateCall', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns CallerContext for an owner caller', async () => {
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom
      .mockReturnValueOnce(makePeopleChain([mockOwner]))
      .mockReturnValueOnce(makePropertiesChain(mockProperty))
      .mockReturnValueOnce(makeIssuesChain(mockIssues))

    const { result } = renderHook(() => useSimulateCall())

    let context: Awaited<ReturnType<typeof result.current.call>> = null
    await act(async () => {
      context = await result.current.call()
    })

    expect(context).toEqual({ person: mockOwner, property: mockProperty, issues: mockIssues })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
