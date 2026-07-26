/**
 * Tests for useDocument and useCollection when Firebase IS configured.
 *
 * This file overrides the global setup.ts mocks:
 *   - ../lib/firebase  → isConfigured: true
 *   - firebase/firestore → onSnapshot controlled by test
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ── Override mocks (hoisted before imports) ────────────────────────────────

vi.mock('../lib/firebase', () => ({
  db:           { type: 'firestore-instance' },
  isConfigured: true,
}))

// vi.hoisted ensures these refs are available inside vi.mock factory closures
const { mockUnsub, mockOnSnapshot, mockOrderBy } = vi.hoisted(() => ({
  mockUnsub:       vi.fn(),
  mockOnSnapshot:  vi.fn(),
  mockOrderBy:     vi.fn().mockReturnValue({ type: 'orderby' }),
}))

vi.mock('firebase/firestore', () => ({
  doc:             vi.fn().mockReturnValue({ type: 'doc-ref' }),
  collection:      vi.fn().mockReturnValue({ type: 'collection-ref' }),
  onSnapshot:      mockOnSnapshot,
  query:           vi.fn(ref => ref),
  orderBy:         mockOrderBy,
  setDoc:          vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn().mockReturnValue('__ts__'),
}))

import { useDocument, useCollection } from '../hooks/useFirestore'

// ── useDocument ─────────────────────────────────────────────────────────────

describe('useDocument — Firebase configured', () => {
  beforeEach(() => {
    mockUnsub.mockReset()
    mockOnSnapshot.mockReset()
  })

  it('starts in loading=true state before snapshot arrives', () => {
    // onSnapshot never fires the callback — simulates pending subscription
    mockOnSnapshot.mockReturnValue(mockUnsub)

    const { result } = renderHook(() => useDocument('col/doc'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns document data when the snapshot exists', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, data: () => ({ score: 99, label: 'A' }) })
      return mockUnsub
    })

    const { result } = renderHook(() =>
      useDocument<{ score: number; label: string }>('col/doc')
    )
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual({ score: 99, label: 'A' })
    expect(result.current.error).toBeNull()
  })

  it('returns data: null when the document does not exist', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => false, data: () => null })
      return mockUnsub
    })

    const { result } = renderHook(() => useDocument('col/missing'))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('surfaces Firestore errors via the error field', () => {
    mockOnSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(new Error('Permission denied'))
      return mockUnsub
    })

    const { result } = renderHook(() => useDocument('col/doc'))
    expect(result.current.error).toBe('Permission denied')
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('calls the unsubscribe function when the component unmounts', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, data: () => ({}) })
      return mockUnsub
    })

    const { unmount } = renderHook(() => useDocument('col/doc'))
    unmount()
    expect(mockUnsub).toHaveBeenCalledTimes(1)
  })

  it('re-subscribes when the path prop changes', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, data: () => ({}) })
      return mockUnsub
    })

    const { rerender } = renderHook(({ p }) => useDocument(p), {
      initialProps: { p: 'col/docA' },
    })
    rerender({ p: 'col/docB' })
    // unsubscribe from old, then subscribe to new
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
  })
})

// ── useCollection ────────────────────────────────────────────────────────────

describe('useCollection — Firebase configured', () => {
  beforeEach(() => {
    mockUnsub.mockReset()
    mockOnSnapshot.mockReset()
    mockOrderBy.mockClear()
  })

  it('starts in loading=true state before snapshot arrives', () => {
    mockOnSnapshot.mockReturnValue(mockUnsub)

    const { result } = renderHook(() => useCollection('col'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns an array of documents mapped from snapshot docs', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({
        docs: [
          { id: 'a', data: () => ({ name: 'Alpha', value: 1 }) },
          { id: 'b', data: () => ({ name: 'Beta',  value: 2 }) },
        ],
      })
      return mockUnsub
    })

    const { result } = renderHook(() =>
      useCollection<{ name: string; value: number }>('col')
    )
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0]).toMatchObject({ id: 'a', name: 'Alpha', value: 1 })
    expect(result.current.data![1]).toMatchObject({ id: 'b', name: 'Beta',  value: 2 })
    expect(result.current.error).toBeNull()
  })

  it('returns an empty array when the collection snapshot has no docs', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ docs: [] })
      return mockUnsub
    })

    const { result } = renderHook(() => useCollection('col'))
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('surfaces collection errors via the error field', () => {
    mockOnSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(new Error('Read failed'))
      return mockUnsub
    })

    const { result } = renderHook(() => useCollection('col'))
    expect(result.current.error).toBe('Read failed')
    expect(result.current.loading).toBe(false)
  })

  it('passes orderBy constraint when orderByField is provided', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ docs: [] })
      return mockUnsub
    })

    renderHook(() => useCollection('col', 'order'))
    expect(mockOrderBy).toHaveBeenCalledWith('order')
  })

  it('does NOT call orderBy when orderByField is omitted', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ docs: [] })
      return mockUnsub
    })

    renderHook(() => useCollection('col'))
    expect(mockOrderBy).not.toHaveBeenCalled()
  })

  it('calls the unsubscribe function when the component unmounts', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ docs: [] })
      return mockUnsub
    })

    const { unmount } = renderHook(() => useCollection('col'))
    unmount()
    expect(mockUnsub).toHaveBeenCalledTimes(1)
  })

  it('re-subscribes when path or orderByField changes', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ docs: [] })
      return mockUnsub
    })

    const { rerender } = renderHook(
      ({ p, o }: { p: string; o?: string }) => useCollection(p, o),
      { initialProps: { p: 'colA', o: undefined } }
    )
    rerender({ p: 'colB', o: 'order' })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
  })
})
