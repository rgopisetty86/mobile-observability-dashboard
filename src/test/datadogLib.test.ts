/**
 * Tests for the real datadog.ts implementation.
 *
 * setup.ts stubs queryMetrics with vi.fn(). This file hoists vi.unmock so the
 * actual module runs, then uses vi.stubEnv + vi.resetModules to load a fresh
 * copy with API keys present, giving us coverage of the fetch-based paths.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Remove the setup.ts mock for this file so the real module is imported
vi.unmock('../lib/datadog')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFetch(overrides: { ok?: boolean; status?: number; statusText?: string; body?: unknown }) {
  return vi.fn().mockResolvedValue({
    ok:       overrides.ok   ?? true,
    status:   overrides.status   ?? 200,
    statusText: overrides.statusText ?? 'OK',
    json: async () => overrides.body ?? {},
  })
}

// ── Unconfigured (no env vars) ─────────────────────────────────────────────

describe('queryMetrics — isDatadogConfigured = false (no env vars)', () => {
  it('returns null immediately without making a fetch call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 1000)
    expect(result).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})

// ── Configured (env vars set, module re-loaded fresh each test) ────────────

describe('queryMetrics — isDatadogConfigured = true', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DATADOG_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_DATADOG_APP_KEY', 'test-app-key')
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('fetches and returns parsed series on success', async () => {
    vi.stubGlobal('fetch', makeFetch({
      body: {
        series: [{
          metric:    'test.metric',
          pointlist: [[2_000_000, 9.9], [3_000_000, 42.0]],
        }],
      },
    }))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test.metric{*}', 0, 9999)

    expect(result).not.toBeNull()
    expect(result!.status).toBe('ok')
    expect(result!.series).toHaveLength(1)
    expect(result!.series[0].metric).toBe('test.metric')
    // timestamps are divided by 1000 (ms → s)
    expect(result!.series[0].pointlist[0].timestamp).toBe(2000)
    expect(result!.series[0].pointlist[1].value).toBe(42.0)
  })

  it('maps unit_list to the unit field when present', async () => {
    vi.stubGlobal('fetch', makeFetch({
      body: {
        series: [{
          metric:    'test',
          pointlist: [[1_000_000, 1]],
          unit_list: [{ name: 'millisecond' }],
        }],
      },
    }))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 9999)
    expect(result!.series[0].unit).toBe('millisecond')
  })

  it('handles a series with an empty pointlist', async () => {
    vi.stubGlobal('fetch', makeFetch({
      body: { series: [{ metric: 'test', pointlist: [] }] },
    }))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 9999)
    expect(result!.series[0].pointlist).toHaveLength(0)
  })

  it('handles missing series field in the response body', async () => {
    vi.stubGlobal('fetch', makeFetch({ body: {} }))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 9999)
    expect(result!.series).toHaveLength(0)
    expect(result!.status).toBe('ok')
  })

  it('returns null when the HTTP response is not ok', async () => {
    vi.stubGlobal('fetch', makeFetch({ ok: false, status: 403, statusText: 'Forbidden' }))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 9999)
    expect(result).toBeNull()
  })

  it('returns null when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))

    const { queryMetrics } = await import('../lib/datadog')
    const result = await queryMetrics('test{*}', 0, 9999)
    expect(result).toBeNull()
  })

  it('sends DD-API-KEY and DD-APPLICATION-KEY headers', async () => {
    const fetchMock = makeFetch({ body: { series: [] } })
    vi.stubGlobal('fetch', fetchMock)

    const { queryMetrics } = await import('../lib/datadog')
    await queryMetrics('test{*}', 0, 9999)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['DD-API-KEY']).toBe('test-api-key')
    expect(headers['DD-APPLICATION-KEY']).toBe('test-app-key')
  })

  it('includes from, to, and query in the URL search params', async () => {
    const fetchMock = makeFetch({ body: { series: [] } })
    vi.stubGlobal('fetch', fetchMock)

    const { queryMetrics } = await import('../lib/datadog')
    await queryMetrics('avg:cpu.usage{*}', 100, 200)

    const [url] = fetchMock.mock.calls[0] as [string]
    // Decode the URL so we can match the original strings regardless of encoding variant
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('query=avg:cpu.usage{*}')
    expect(decoded).toContain('from=100')
    expect(decoded).toContain('to=200')
  })
})
