/**
 * Domain hook tests.
 *
 * Firebase is mocked in setup.ts (isConfigured = false), so all hooks
 * return their typed mock fallback data immediately — no real network calls.
 */
import { describe, it, expect } from 'vitest'
import { renderHook }           from '@testing-library/react'
import { useSREData }           from '../hooks/useSREData'
import { useProductData }       from '../hooks/useProductData'
import { useExecutiveData }     from '../hooks/useExecutiveData'
import { useEngineeringData }   from '../hooks/useEngineeringData'
import { useSecurityData }      from '../hooks/useSecurityData'

// ── useSREData ────────────────────────────────────────────────────────────

describe('useSREData (Firebase unconfigured)', () => {
  it('is not loading when Firebase is unconfigured', () => {
    const { result } = renderHook(() => useSREData())
    expect(result.current.loading).toBe(false)
  })

  it('returns all 4 KPI fields from mock data', () => {
    const { result } = renderHook(() => useSREData())
    const { kpis } = result.current
    expect(kpis.crashFree).toMatch(/%$/)
    expect(kpis.apiAvail).toMatch(/%$/)
    expect(kpis.pushDelivery).toMatch(/%$/)
    expect(kpis.timeToCode).toMatch(/s$/)
  })

  it('returns non-empty latency time series', () => {
    const { result } = renderHook(() => useSREData())
    expect(result.current.latency.length).toBeGreaterThan(0)
    expect(result.current.latency[0]).toMatchObject({
      time: expect.any(String),
      p50: expect.any(Number),
      p95: expect.any(Number),
      p99: expect.any(Number),
    })
  })

  it('returns burn items with colorToken field', () => {
    const { result } = renderHook(() => useSREData())
    result.current.burn.forEach(b => {
      expect(b).toHaveProperty('colorToken')
      expect(['success', 'warning', 'danger']).toContain(b.colorToken)
    })
  })

  it('returns 5 dependency entries', () => {
    const { result } = renderHook(() => useSREData())
    expect(result.current.deps).toHaveLength(5)
  })

  it('returns at least one alert with badge and badgeLabel', () => {
    const { result } = renderHook(() => useSREData())
    const { alerts } = result.current
    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0]).toMatchObject({
      badge:      expect.stringMatching(/^badge-/),
      badgeLabel: expect.any(String),
      text:       expect.any(String),
    })
  })
})

// ── useProductData ────────────────────────────────────────────────────────

describe('useProductData (Firebase unconfigured)', () => {
  it('is not loading when Firebase is unconfigured', () => {
    const { result } = renderHook(() => useProductData())
    expect(result.current.loading).toBe(false)
  })

  it('returns all 4 KPI fields', () => {
    const { result } = renderHook(() => useProductData())
    const { kpis } = result.current
    expect(kpis.mau).toBeTruthy()
    expect(kpis.dau).toBeTruthy()
    expect(kpis.stickiness).toMatch(/%$/)
    expect(kpis.d30Retention).toMatch(/%$/)
  })

  it('returns 7-point MAU trend', () => {
    const { result } = renderHook(() => useProductData())
    expect(result.current.mauTrend).toHaveLength(7)
    expect(result.current.mauTrend[0]).toMatchObject({
      day: expect.any(String),
      mau: expect.any(Number),
    })
  })

  it('returns 6-step enrollment funnel starting at 100%', () => {
    const { result } = renderHook(() => useProductData())
    const { funnelSteps } = result.current
    expect(funnelSteps).toHaveLength(6)
    expect(funnelSteps[0].pct).toBe(100)
    funnelSteps.forEach(s => {
      expect(s).toHaveProperty('dropColorToken')
    })
  })

  it('returns 5 feature adoption items', () => {
    const { result } = renderHook(() => useProductData())
    expect(result.current.featureAdoption).toHaveLength(5)
  })

  it('returns 3-slice auth mix adding to 100', () => {
    const { result } = renderHook(() => useProductData())
    const total = result.current.authMix.reduce((s, a) => s + a.value, 0)
    expect(result.current.authMix).toHaveLength(3)
    expect(total).toBe(100)
  })
})

// ── useExecutiveData ──────────────────────────────────────────────────────

describe('useExecutiveData (Firebase unconfigured)', () => {
  it('is not loading when Firebase is unconfigured', () => {
    const { result } = renderHook(() => useExecutiveData())
    expect(result.current.loading).toBe(false)
  })

  it('returns all 5 KPI fields', () => {
    const { result } = renderHook(() => useExecutiveData())
    const { kpis } = result.current
    expect(kpis.mau).toBeTruthy()
    expect(kpis.installs).toBeTruthy()
    expect(kpis.d30Retention).toMatch(/%$/)
    expect(kpis.nps).toBeTruthy()
    expect(kpis.rating).toContain('★')
  })

  it('returns 12-month MAU growth series', () => {
    const { result } = renderHook(() => useExecutiveData())
    expect(result.current.mauGrowth).toHaveLength(12)
  })

  it('returns 5 reliability scorecard rows', () => {
    const { result } = renderHook(() => useExecutiveData())
    expect(result.current.reliability).toHaveLength(5)
  })

  it('returns 5 security scorecard rows', () => {
    const { result } = renderHook(() => useExecutiveData())
    expect(result.current.security).toHaveLength(5)
  })

  it('returns iOS + Android platform mix', () => {
    const { result } = renderHook(() => useExecutiveData())
    const labels = result.current.platformMix.map(p => p.label)
    expect(labels).toContain('iOS')
    expect(labels).toContain('Android')
  })
})

// ── useEngineeringData ────────────────────────────────────────────────────

describe('useEngineeringData (Firebase unconfigured)', () => {
  it('is not loading when Firebase is unconfigured', () => {
    const { result } = renderHook(() => useEngineeringData())
    expect(result.current.loading).toBe(false)
  })

  it('returns crashFree KPI ending with %', () => {
    const { result } = renderHook(() => useEngineeringData())
    expect(result.current.kpis.crashFree).toMatch(/%$/)
  })

  it('returns 4 crash signatures', () => {
    const { result } = renderHook(() => useEngineeringData())
    expect(result.current.signatures).toHaveLength(4)
    expect(result.current.signatures[0]).toMatchObject({
      name:      expect.any(String),
      platform:  expect.any(String),
      count:     expect.any(String),
      highlight: expect.any(Boolean),
    })
  })

  it('returns version crash rates as numbers', () => {
    const { result } = renderHook(() => useEngineeringData())
    result.current.versions.forEach(v => {
      expect(typeof v.rate).toBe('number')
    })
  })
})

// ── useSecurityData ───────────────────────────────────────────────────────

describe('useSecurityData (Firebase unconfigured)', () => {
  it('is not loading when Firebase is unconfigured', () => {
    const { result } = renderHook(() => useSecurityData())
    expect(result.current.loading).toBe(false)
  })

  it('returns all 5 KPI fields', () => {
    const { result } = renderHook(() => useSecurityData())
    const { kpis } = result.current
    expect(kpis.mfaFatigue).toBeTruthy()
    expect(kpis.geoImpossibilities).toBeTruthy()
    expect(kpis.integrityViolations).toBeTruthy()
    expect(kpis.accountsLocked).toBeTruthy()
    expect(typeof kpis.activeInvestigations).toBe('number')
  })

  it('returns threat events with required fields', () => {
    const { result } = renderHook(() => useSecurityData())
    result.current.threats.forEach(t => {
      expect(t).toMatchObject({
        time:      expect.any(String),
        fatigue:   expect.any(Number),
        integrity: expect.any(Number),
        geo:       expect.any(Number),
      })
    })
  })

  it('returns security events with valid severity values', () => {
    const { result } = renderHook(() => useSecurityData())
    result.current.events.forEach(e => {
      expect(['critical', 'high', 'medium']).toContain(e.severity)
    })
  })
})
