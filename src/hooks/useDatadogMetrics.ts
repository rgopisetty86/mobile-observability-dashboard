/**
 * useDatadogMetrics
 *
 * Queries Datadog for live metrics and writes them into Firestore so all
 * existing dashboard hooks (useSREData, useEngineeringData, etc.) pick up
 * real values automatically — no dashboard code needs to change.
 *
 * Usage — mount once at the app root (e.g. inside App.tsx):
 *   import { useDatadogMetrics } from './hooks/useDatadogMetrics'
 *   // inside App component:
 *   useDatadogMetrics()    // fire-and-forget; syncs on mount + every interval
 *
 * When either Datadog or Firebase is unconfigured this hook is a no-op.
 *
 * Metric queries below use standard Datadog metric names. Replace the query
 * strings with your own org's metric names / tags as needed.
 */

import { useEffect } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isConfigured as isFirebaseConfigured } from '../lib/firebase'
import {
  isDatadogConfigured,
  queryMetrics,
  latestValue,
  hoursAgo,
  daysAgo,
} from '../lib/datadog'

/** How often to re-sync Datadog → Firestore (milliseconds). Default: 60s. */
const SYNC_INTERVAL_MS = 60_000

// ── Metric query definitions ───────────────────────────────────────────────
// Each entry maps a Firestore document path + field to a Datadog query.
// Adjust `query` strings to match your Datadog org's metric names and tags.

interface MetricMapping {
  /** Datadog metrics query string */
  query: string
  /** Firestore document path (will be created / merged) */
  docPath: string
  /** Field name inside the document to write the value to */
  field: string
  /** Optional transform: converts raw float to a display string */
  format?: (v: number) => string
  /** Time range in hours to query (default: 1) */
  rangeHours?: number
}

const METRIC_MAPPINGS: MetricMapping[] = [
  // ── SRE KPIs ──────────────────────────────────────────────────────────────
  {
    query:      'avg:mobile.crash_free_sessions_rate{*}',
    docPath:    'analytics/sre/kpis/current',
    field:      'crashFree',
    format:     v => v.toFixed(2) + '%',
  },
  {
    query:      'avg:mobile.api_availability{*}',
    docPath:    'analytics/sre/kpis/current',
    field:      'apiAvail',
    format:     v => v.toFixed(2) + '%',
  },
  {
    query:      'avg:mobile.push_delivery_rate{*}',
    docPath:    'analytics/sre/kpis/current',
    field:      'pushDelivery',
    format:     v => v.toFixed(2) + '%',
  },
  {
    query:      'p95:mobile.time_to_first_code{*}',
    docPath:    'analytics/sre/kpis/current',
    field:      'timeToCode',
    format:     v => v.toFixed(2) + 's',
  },

  // ── Engineering KPIs ──────────────────────────────────────────────────────
  {
    query:      'avg:mobile.crash_free_sessions_rate{*}',
    docPath:    'analytics/crashes/kpis/current',
    field:      'crashFree',
    format:     v => v.toFixed(2) + '%',
  },
  {
    query:      'avg:mobile.anr_free_rate{*}',
    docPath:    'analytics/crashes/kpis/current',
    field:      'anrFree',
    format:     v => v.toFixed(2) + '%',
  },
  {
    query:      'sum:mobile.crash_affected_users{*}',
    docPath:    'analytics/crashes/kpis/current',
    field:      'affectedUsers',
    format:     v => Math.round(v).toLocaleString(),
  },

  // ── Security KPIs ─────────────────────────────────────────────────────────
  {
    query:      'sum:security.mfa_fatigue_blocked{*}',
    docPath:    'analytics/security/kpis/current',
    field:      'mfaFatigue',
    format:     v => Math.round(v).toLocaleString(),
    rangeHours: 24,
  },
  {
    query:      'sum:security.geo_impossibility_events{*}',
    docPath:    'analytics/security/kpis/current',
    field:      'geoImpossibilities',
    format:     v => Math.round(v).toLocaleString(),
    rangeHours: 24,
  },
  {
    query:      'sum:security.integrity_violations{*}',
    docPath:    'analytics/security/kpis/current',
    field:      'integrityViolations',
    format:     v => Math.round(v).toLocaleString(),
    rangeHours: 24,
  },
  {
    query:      'sum:security.accounts_locked{*}',
    docPath:    'analytics/security/kpis/current',
    field:      'accountsLocked',
    format:     v => Math.round(v).toLocaleString(),
    rangeHours: 24,
  },

  // ── Product KPIs ──────────────────────────────────────────────────────────
  {
    query:      'avg:mobile.monthly_active_users{*}',
    docPath:    'analytics/product/kpis/current',
    field:      'mau',
    format:     v => (v / 1_000_000).toFixed(1) + 'M',
    rangeHours: 24,
  },
  {
    query:      'avg:mobile.daily_active_users{*}',
    docPath:    'analytics/product/kpis/current',
    field:      'dau',
    format:     v => (v / 1_000_000).toFixed(1) + 'M',
    rangeHours: 24,
  },

  // ── Executive KPIs ────────────────────────────────────────────────────────
  {
    query:      'avg:mobile.monthly_active_users{*}',
    docPath:    'analytics/executive/kpis/current',
    field:      'mau',
    format:     v => (v / 1_000_000).toFixed(1) + 'M',
    rangeHours: 24,
  },
  {
    query:      'sum:mobile.new_installs{*}',
    docPath:    'analytics/executive/kpis/current',
    field:      'installs',
    format:     v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(Math.round(v)),
    rangeHours: 24,
  },
]

// ── Sync function ──────────────────────────────────────────────────────────

async function syncDatadogToFirestore() {
  if (!isDatadogConfigured || !isFirebaseConfigured) return

  // Group mappings by docPath so we can batch-write each document once
  const byDoc = new Map<string, Record<string, unknown>>()

  await Promise.all(
    METRIC_MAPPINGS.map(async m => {
      const now  = Math.floor(Date.now() / 1000)
      const from = now - (m.rangeHours ?? 1) * 3600
      const result = await queryMetrics(m.query, from, now)
      if (!result || result.status !== 'ok') return

      const raw = latestValue(result.series)
      if (raw === null) return

      const displayValue = m.format ? m.format(raw) : raw

      if (!byDoc.has(m.docPath)) byDoc.set(m.docPath, {})
      byDoc.get(m.docPath)![m.field] = displayValue
    })
  )

  await Promise.all(
    Array.from(byDoc.entries()).map(([path, fields]) =>
      setDoc(doc(db, path), { ...fields, _syncedAt: serverTimestamp() }, { merge: true })
    )
  )

  console.log(`[Datadog→Firestore] Synced ${byDoc.size} document(s) at ${new Date().toISOString()}`)
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useDatadogMetrics() {
  useEffect(() => {
    if (!isDatadogConfigured || !isFirebaseConfigured) return

    // Sync immediately on mount, then on interval
    syncDatadogToFirestore()
    const id = setInterval(syncDatadogToFirestore, SYNC_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
}

// Export for manual / one-shot use (e.g. Cloud Function, test scripts)
export { syncDatadogToFirestore, hoursAgo, daysAgo }
