/**
 * Datadog REST API client.
 *
 * Reads credentials from Vite env vars:
 *   VITE_DATADOG_API_KEY  — Datadog API key (read access is enough)
 *   VITE_DATADOG_APP_KEY  — Datadog Application key
 *   VITE_DATADOG_SITE     — e.g. "datadoghq.com" (default) or "datadoghq.eu", "us3.datadoghq.com"
 *
 * All env vars are optional — when absent, isConfigured is false and every
 * call returns null without throwing so callers can skip gracefully.
 */

const API_KEY  = import.meta.env.VITE_DATADOG_API_KEY  as string | undefined
const APP_KEY  = import.meta.env.VITE_DATADOG_APP_KEY  as string | undefined
const DD_SITE  = (import.meta.env.VITE_DATADOG_SITE as string | undefined) ?? 'datadoghq.com'

export const isDatadogConfigured = Boolean(API_KEY && APP_KEY)

if (!isDatadogConfigured) {
  console.warn(
    '[Datadog] VITE_DATADOG_API_KEY / VITE_DATADOG_APP_KEY are not set. ' +
    'Add them to .env.local to enable live metric sync.'
  )
}

const BASE = `https://api.${DD_SITE}`

const headers = () => ({
  'DD-API-KEY':         API_KEY ?? '',
  'DD-APPLICATION-KEY': APP_KEY ?? '',
  'Content-Type':       'application/json',
})

// ── Types ──────────────────────────────────────────────────────────────────

export interface DDMetricPoint {
  timestamp: number   // unix seconds
  value:     number
}

export interface DDMetricSeries {
  metric:     string
  pointlist:  DDMetricPoint[]
  unit?:      string
}

export interface DDQueryResult {
  series: DDMetricSeries[]
  status: 'ok' | 'error'
  error?: string
}

// ── Metrics Query API (v1) ─────────────────────────────────────────────────

/**
 * Query one or more metrics over a time range.
 *
 * @param query  Datadog metrics query string, e.g. "avg:system.cpu.user{*}"
 * @param from   Start time as unix timestamp (seconds)
 * @param to     End time as unix timestamp (seconds)
 */
export async function queryMetrics(
  query: string,
  from: number,
  to: number
): Promise<DDQueryResult | null> {
  if (!isDatadogConfigured) return null

  try {
    const params = new URLSearchParams({
      query,
      from: String(from),
      to:   String(to),
    })
    const res = await fetch(`${BASE}/api/v1/query?${params}`, { headers: headers() })
    if (!res.ok) {
      console.error(`[Datadog] queryMetrics failed: ${res.status} ${res.statusText}`)
      return null
    }
    const json = await res.json()
    return {
      series: (json.series ?? []).map((s: Record<string, unknown>) => ({
        metric:    s.metric,
        unit:      (s.unit_list as Array<{name: string}> | undefined)?.[0]?.name,
        pointlist: ((s.pointlist ?? []) as [number, number][]).map(([ts, val]) => ({
          timestamp: ts / 1000,
          value:     val,
        })),
      })),
      status: 'ok',
    }
  } catch (err) {
    console.error('[Datadog] queryMetrics error:', err)
    return null
  }
}

// ── Convenience helpers ────────────────────────────────────────────────────

/** Returns unix timestamp for N hours ago. */
export const hoursAgo = (n: number) => Math.floor(Date.now() / 1000) - n * 3600

/** Returns unix timestamp for N days ago. */
export const daysAgo  = (n: number) => Math.floor(Date.now() / 1000) - n * 86400

/** Returns the latest value from a series, or null if empty. */
export function latestValue(series: DDMetricSeries[]): number | null {
  if (!series.length) return null
  const pts = series[0].pointlist
  return pts.length ? pts[pts.length - 1].value : null
}

/** Returns all points from the first series as { time, value } pairs. */
export function firstSeriesPoints(series: DDMetricSeries[], labelKey = 'time'): Record<string, unknown>[] {
  if (!series.length) return []
  return series[0].pointlist.map((p, i) => ({
    [labelKey]: new Date(p.timestamp * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    value: p.value,
    index: i,
  }))
}
