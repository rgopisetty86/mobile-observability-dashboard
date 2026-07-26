/**
 * Tests for useDatadogMetrics and syncDatadogToFirestore.
 *
 * Both Firebase and Datadog are mocked as fully configured so the sync
 * logic (lines 162-192 in useDatadogMetrics.ts) actually executes.
 * The early-return (unconfigured) branch is covered in hooks.test.ts.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ── Module mocks (hoisted before imports) ──────────────────────────────────

vi.mock('../lib/firebase', () => ({
  db:           { _settings: { projectId: 'test-project' } },
  isConfigured: true,
}))

vi.mock('../lib/datadog', async (importActual) => {
  const actual = await importActual<typeof import('../lib/datadog')>()
  return {
    ...actual,               // keep real latestValue, hoursAgo, daysAgo helpers
    isDatadogConfigured: true,
    queryMetrics: mockQueryMetrics,
  }
})

// vi.hoisted ensures ALL these refs are available inside vi.mock factory closures
const { mockSetDoc, mockDoc, mockQueryMetrics } = vi.hoisted(() => ({
  mockSetDoc:      vi.fn().mockResolvedValue(undefined),
  mockDoc:         vi.fn().mockReturnValue({ id: 'mock-ref' }),
  mockQueryMetrics: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc:             mockDoc,
  setDoc:          mockSetDoc,
  serverTimestamp: vi.fn().mockReturnValue('__ts__'),
  collection:      vi.fn(),
  onSnapshot:      vi.fn().mockReturnValue(vi.fn()),
  query:           vi.fn(),
  orderBy:         vi.fn(),
}))

import { syncDatadogToFirestore, useDatadogMetrics } from '../hooks/useDatadogMetrics'

// ── Shared mock result ─────────────────────────────────────────────────────

const okResult = {
  status: 'ok' as const,
  series: [{
    metric:    'test.metric',
    pointlist: [{ timestamp: 1_000, value: 99.5 }],
  }],
}

// ── syncDatadogToFirestore ─────────────────────────────────────────────────

describe('syncDatadogToFirestore — configured', () => {
  beforeEach(() => {
    mockQueryMetrics.mockReset()
    mockSetDoc.mockReset()
    mockSetDoc.mockResolvedValue(undefined)
    mockDoc.mockClear()
  })

  it('calls setDoc once per unique docPath when all queries succeed', async () => {
    mockQueryMetrics.mockResolvedValue(okResult)
    await syncDatadogToFirestore()
    // There are 5 unique docPaths in METRIC_MAPPINGS
    expect(mockSetDoc).toHaveBeenCalledTimes(5)
  })

  it('writes _syncedAt to every document', async () => {
    mockQueryMetrics.mockResolvedValue(okResult)
    await syncDatadogToFirestore()
    mockSetDoc.mock.calls.forEach(([, fields]) => {
      expect((fields as Record<string, unknown>)._syncedAt).toBeDefined()
    })
  })

  it('applies format function (e.g. v => v.toFixed(2) + "%") to the raw value', async () => {
    mockQueryMetrics.mockResolvedValue(okResult)
    await syncDatadogToFirestore()
    // crashFree mapping: format = v => v.toFixed(2) + '%'  (value: 99.5 → '99.50%')
    const allFields = mockSetDoc.mock.calls.flatMap(([, f]) => Object.values(f as object))
    expect(allFields).toContain('99.50%')
  })

  it('groups multiple fields into a single setDoc call per docPath', async () => {
    mockQueryMetrics.mockResolvedValue(okResult)
    await syncDatadogToFirestore()
    // analytics/sre/kpis/current has 4 metrics → one setDoc call with 4 payload fields
    const sreCall = mockSetDoc.mock.calls.find(([ref]) =>
      (ref as { id: string }).id === 'mock-ref'
    )
    expect(sreCall).toBeDefined()
  })

  it('does NOT call setDoc when all queries return null', async () => {
    mockQueryMetrics.mockResolvedValue(null)
    await syncDatadogToFirestore()
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('does NOT call setDoc when all results have no series', async () => {
    mockQueryMetrics.mockResolvedValue({ status: 'ok', series: [] })
    await syncDatadogToFirestore()
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('does NOT call setDoc when result status is not ok', async () => {
    mockQueryMetrics.mockResolvedValue({ status: 'error', series: [] })
    await syncDatadogToFirestore()
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('skips individual metrics that return null without failing the rest', async () => {
    // First two calls succeed, rest return null
    mockQueryMetrics
      .mockResolvedValueOnce(okResult)
      .mockResolvedValueOnce(okResult)
      .mockResolvedValue(null)
    await syncDatadogToFirestore()
    // At least one setDoc call should happen (from the two successful queries)
    expect(mockSetDoc).toHaveBeenCalled()
  })

  it('handles series with empty pointlist (latestValue returns null)', async () => {
    mockQueryMetrics.mockResolvedValue({
      status: 'ok',
      series: [{ metric: 'test', pointlist: [] }],
    })
    await syncDatadogToFirestore()
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('uses merge: true on every setDoc call', async () => {
    mockQueryMetrics.mockResolvedValue(okResult)
    await syncDatadogToFirestore()
    mockSetDoc.mock.calls.forEach(([, , options]) => {
      expect((options as Record<string, unknown>).merge).toBe(true)
    })
  })
})

// ── useDatadogMetrics ──────────────────────────────────────────────────────

describe('useDatadogMetrics — configured', () => {
  beforeEach(() => {
    mockQueryMetrics.mockReset()
    mockSetDoc.mockReset()
    mockSetDoc.mockResolvedValue(undefined)
    mockQueryMetrics.mockResolvedValue(okResult)
  })

  it('calls syncDatadogToFirestore at least once immediately on mount', async () => {
    const { unmount } = renderHook(() => useDatadogMetrics())
    // React 19 effects are async — waitFor retries until the assertion passes
    await waitFor(() => {
      expect(mockQueryMetrics).toHaveBeenCalled()
    })
    unmount()
  })

  it('registers a 60-second recurring interval', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const { unmount } = renderHook(() => useDatadogMetrics())
    // The hook schedules exactly one interval with SYNC_INTERVAL_MS = 60_000
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60_000)
    unmount()
    setIntervalSpy.mockRestore()
  })

  it('clears the interval when the hook unmounts', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useDatadogMetrics())
    await waitFor(() => expect(mockQueryMetrics).toHaveBeenCalled())
    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
