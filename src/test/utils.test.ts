import { describe, it, expect } from 'vitest'
import { resolveColorToken }    from '../hooks/useSREData'
import { resolveDropColor }     from '../hooks/useProductData'
import { resolveScorecardColor } from '../hooks/useExecutiveData'
import { resolveColor, severityBadge } from '../hooks/useSecurityData'
import { latestValue, hoursAgo, daysAgo, firstSeriesPoints } from '../lib/datadog'

// ── useSREData helpers ────────────────────────────────────────────────────

describe('resolveColorToken', () => {
  it('maps "success" to CSS var', () => {
    expect(resolveColorToken('success')).toBe('var(--success)')
  })
  it('maps "warning" to CSS var', () => {
    expect(resolveColorToken('warning')).toBe('var(--warning)')
  })
  it('maps "danger" to CSS var', () => {
    expect(resolveColorToken('danger')).toBe('var(--danger)')
  })
  it('passes through unknown tokens unchanged', () => {
    expect(resolveColorToken('var(--custom)')).toBe('var(--custom)')
  })
})

// ── useProductData helpers ────────────────────────────────────────────────

describe('resolveDropColor', () => {
  it('maps "success" correctly', () => {
    expect(resolveDropColor('success')).toBe('var(--success)')
  })
  it('maps "danger" correctly', () => {
    expect(resolveDropColor('danger')).toBe('var(--danger)')
  })
  it('maps "muted" to text-secondary', () => {
    expect(resolveDropColor('muted')).toBe('var(--text-secondary)')
  })
  it('maps "neutral" to text-tertiary', () => {
    expect(resolveDropColor('neutral')).toBe('var(--text-tertiary)')
  })
  it('passes through unknown tokens unchanged', () => {
    expect(resolveDropColor('#ff0000')).toBe('#ff0000')
  })
})

// ── useExecutiveData helpers ──────────────────────────────────────────────

describe('resolveScorecardColor', () => {
  it('returns undefined when no token provided', () => {
    expect(resolveScorecardColor(undefined)).toBeUndefined()
  })
  it('maps "success"', () => {
    expect(resolveScorecardColor('success')).toBe('var(--success)')
  })
  it('maps "accent"', () => {
    expect(resolveScorecardColor('accent')).toBe('var(--accent)')
  })
  it('maps "teal"', () => {
    expect(resolveScorecardColor('teal')).toBe('var(--teal)')
  })
})

// ── useSecurityData helpers ───────────────────────────────────────────────

describe('resolveColor', () => {
  it('maps "warning"', () => {
    expect(resolveColor('warning')).toBe('var(--warning)')
  })
  it('maps "danger"', () => {
    expect(resolveColor('danger')).toBe('var(--danger)')
  })
  it('passes through CSS vars directly', () => {
    expect(resolveColor('var(--success)')).toBe('var(--success)')
  })
})

describe('severityBadge', () => {
  it('maps "critical" to badge-danger', () => {
    expect(severityBadge('critical')).toBe('badge-danger')
  })
  it('maps "high" to badge-warning', () => {
    expect(severityBadge('high')).toBe('badge-warning')
  })
  it('maps "medium" to badge-neutral (default)', () => {
    expect(severityBadge('medium')).toBe('badge-neutral')
  })
  it('defaults unknown severity to badge-neutral', () => {
    expect(severityBadge('low')).toBe('badge-neutral')
  })
})

// ── Datadog helpers ───────────────────────────────────────────────────────

describe('latestValue', () => {
  it('returns null for empty series array', () => {
    expect(latestValue([])).toBeNull()
  })
  it('returns null for series with no points', () => {
    expect(latestValue([{ metric: 'foo', pointlist: [] }])).toBeNull()
  })
  it('returns the last point value', () => {
    expect(latestValue([{
      metric: 'foo',
      pointlist: [
        { timestamp: 1000, value: 1.5 },
        { timestamp: 2000, value: 9.9 },
      ],
    }])).toBe(9.9)
  })
})

describe('hoursAgo', () => {
  it('returns a timestamp approximately n hours before now', () => {
    const now  = Math.floor(Date.now() / 1000)
    const result = hoursAgo(2)
    expect(result).toBeLessThan(now)
    expect(result).toBeGreaterThan(now - 2 * 3600 - 5)
  })
})

describe('daysAgo', () => {
  it('returns a timestamp approximately n days before now', () => {
    const now  = Math.floor(Date.now() / 1000)
    const result = daysAgo(7)
    expect(result).toBeLessThan(now)
    expect(result).toBeGreaterThan(now - 7 * 86400 - 5)
  })
})

describe('firstSeriesPoints', () => {
  it('returns empty array for empty series', () => {
    expect(firstSeriesPoints([])).toEqual([])
  })
  it('maps pointlist to readable objects', () => {
    const pts = firstSeriesPoints([{
      metric: 'foo',
      pointlist: [{ timestamp: 0, value: 42 }],
    }])
    expect(pts).toHaveLength(1)
    expect(pts[0]).toMatchObject({ value: 42, index: 0 })
  })
})
