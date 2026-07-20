import { useDocument, useCollection } from './useFirestore'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SREKpis {
  crashFree:    string  // e.g. "99.97%"
  apiAvail:     string  // e.g. "99.94%"
  pushDelivery: string  // e.g. "99.62%"
  timeToCode:   string  // e.g. "1.28s"
}

export interface LatencyPoint {
  time: string   // e.g. "-60m", "now"
  p50:  number
  p95:  number
  p99:  number
  order?: number
}

export interface BurnItem {
  label:      string   // e.g. "Push delivery"
  width:      string   // CSS % string e.g. "68%"
  value:      string   // e.g. "6.8× burning"
  colorToken: string   // "success" | "warning" | "danger"
  order?:     number
}

export interface DepItem {
  name:   string   // e.g. "FCM"
  status: string   // "success" | "warning" | "danger"
  label:  string   // e.g. "healthy", "degraded", ""
  value:  string   // e.g. "890ms"
  order?: number
}

export interface AlertItem {
  badge:      string   // e.g. "badge-danger"
  badgeLabel: string   // e.g. "page"
  text:       string
  age:        string   // e.g. "14m ago"
  action:     string   // e.g. "runbook ↗"
  order?:     number
}

// ── Color token resolver ───────────────────────────────────────────────────

export function resolveColorToken(token: string): string {
  const map: Record<string, string> = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger:  'var(--danger)',
  }
  return map[token] ?? token
}

// ── Fallback mock data ─────────────────────────────────────────────────────

const MOCK_KPIS: SREKpis = {
  crashFree:    '99.97%',
  apiAvail:     '99.94%',
  pushDelivery: '99.62%',
  timeToCode:   '1.28s',
}

const MOCK_LATENCY: LatencyPoint[] = [
  { time: '-60m', p50: 1.1, p95: 2.4, p99: 3.8 },
  { time: '-55m', p50: 1.0, p95: 2.3, p99: 3.7 },
  { time: '-50m', p50: 1.1, p95: 2.5, p99: 3.9 },
  { time: '-45m', p50: 1.2, p95: 2.4, p99: 3.8 },
  { time: '-40m', p50: 1.1, p95: 2.6, p99: 4.1 },
  { time: '-35m', p50: 1.0, p95: 2.5, p99: 4.0 },
  { time: '-30m', p50: 1.1, p95: 2.4, p99: 3.9 },
  { time: '-25m', p50: 1.2, p95: 2.6, p99: 4.2 },
  { time: '-20m', p50: 1.1, p95: 2.8, p99: 4.5 },
  { time: '-15m', p50: 1.3, p95: 3.4, p99: 5.6 },
  { time: '-10m', p50: 1.2, p95: 3.8, p99: 6.2 },
  { time: '-5m',  p50: 1.3, p95: 4.0, p99: 6.5 },
  { time: 'now',  p50: 1.2, p95: 4.1, p99: 6.8 },
]

const MOCK_BURN: BurnItem[] = [
  { label: 'Crash-free',      width: '8%',  value: '0.4× normal', colorToken: 'success' },
  { label: 'API availability',width: '22%', value: '1.1× normal', colorToken: 'success' },
  { label: 'Push delivery',   width: '68%', value: '6.8× burning',colorToken: 'warning' },
  { label: 'Time-to-code',    width: '14%', value: '0.7× normal', colorToken: 'success' },
  { label: 'Backup success',  width: '18%', value: '0.9× normal', colorToken: 'success' },
]

const MOCK_DEPS: DepItem[] = [
  { name: 'APNs',         status: 'success', label: 'healthy',  value: '142ms' },
  { name: 'FCM',          status: 'warning', label: 'degraded', value: '890ms' },
  { name: 'Primary DB',   status: 'success', label: 'healthy',  value: '4ms' },
  { name: 'Redis cache',  status: 'success', label: '',         value: '94.2% hit' },
  { name: 'Identity IdP', status: 'success', label: 'healthy',  value: '38ms' },
]

const MOCK_ALERTS: AlertItem[] = [
  { badge: 'badge-danger',  badgeLabel: 'page', text: 'Push delivery SLO burn 6.8× — FCM Asia region',              age: '14m ago', action: 'runbook ↗' },
  { badge: 'badge-warning', badgeLabel: 'warn', text: 'FCM dispatch latency p99 elevated (890ms vs 200ms baseline)', age: '22m ago', action: 'runbook ↗' },
  { badge: 'badge-neutral', badgeLabel: 'info', text: 'Release v4.12.1 rollout at 47% (3.2M users)',                 age: '2h ago',  action: 'details ↗' },
]

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSREData() {
  const kpisResult    = useDocument<SREKpis>('analytics/sre/kpis/current')
  const latencyResult = useCollection<LatencyPoint>('analytics/sre/latency', 'order')
  const burnResult    = useCollection<BurnItem>('analytics/sre/burn', 'order')
  const depsResult    = useCollection<DepItem>('analytics/sre/deps', 'order')
  const alertsResult  = useCollection<AlertItem>('analytics/sre/alerts', 'order')

  const loading =
    kpisResult.loading || latencyResult.loading || burnResult.loading ||
    depsResult.loading || alertsResult.loading

  return {
    loading,
    kpis:    kpisResult.data    ?? MOCK_KPIS,
    latency: latencyResult.data ?? MOCK_LATENCY,
    burn:    burnResult.data    ?? MOCK_BURN,
    deps:    depsResult.data    ?? MOCK_DEPS,
    alerts:  alertsResult.data  ?? MOCK_ALERTS,
  }
}
