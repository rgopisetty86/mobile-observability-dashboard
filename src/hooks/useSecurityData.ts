import { useDocument, useCollection } from './useFirestore'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SecKpis {
  mfaFatigue:          string   // e.g. "847"
  geoImpossibilities:  string   // e.g. "62"
  integrityViolations: string   // e.g. "1,284"
  accountsLocked:      string   // e.g. "93"
  activeInvestigations: number
}

export interface ThreatPoint {
  time:      string
  fatigue:   number
  integrity: number
  geo:       number
  order?:    number
}

export interface IntegrityItem {
  label:      string
  count:      number
  width:      number   // 0-100 percentage for bar
  colorToken: string   // 'warning' | 'danger' — resolved to CSS var in the component
}

export interface SecEvent {
  severity:    'critical' | 'high' | 'medium'
  text:        string
  geo:         string
  affected:    string
  status:      string
  statusColor: string
  order?:      number
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Map stored colorToken string to a CSS variable string */
export function resolveColor(token: string): string {
  const map: Record<string, string> = {
    warning: 'var(--warning)',
    danger:  'var(--danger)',
    success: 'var(--success)',
  }
  return map[token] ?? token
}

/** Map severity to badge class */
export function severityBadge(severity: string): string {
  if (severity === 'critical') return 'badge-danger'
  if (severity === 'high')     return 'badge-warning'
  return 'badge-neutral'
}

// ── Fallback mock data ─────────────────────────────────────────────────────

const MOCK_KPIS: SecKpis = {
  mfaFatigue:           '847',
  geoImpossibilities:   '62',
  integrityViolations:  '1,284',
  accountsLocked:       '93',
  activeInvestigations: 3,
}

const MOCK_THREATS: ThreatPoint[] = [
  { time: '-24h', fatigue: 42,  integrity: 180, geo: 8 },
  { time: '-20h', fatigue: 38,  integrity: 195, geo: 12 },
  { time: '-16h', fatigue: 45,  integrity: 210, geo: 9 },
  { time: '-12h', fatigue: 41,  integrity: 198, geo: 11 },
  { time: '-8h',  fatigue: 58,  integrity: 220, geo: 10 },
  { time: '-4h',  fatigue: 184, integrity: 215, geo: 8 },
  { time: 'now',  fatigue: 312, integrity: 188, geo: 12 },
]

const MOCK_INTEGRITY: IntegrityItem[] = [
  { label: 'Jailbreak / root',    count: 684, width: 53, colorToken: 'warning' },
  { label: 'Debugger attached',   count: 312, width: 24, colorToken: 'warning' },
  { label: 'TLS pinning bypass',  count: 187, width: 15, colorToken: 'danger' },
  { label: 'Frida hook detected', count: 68,  width: 5,  colorToken: 'danger' },
  { label: 'Binary tampering',    count: 33,  width: 3,  colorToken: 'danger' },
]

const MOCK_EVENTS: SecEvent[] = [
  { severity: 'critical', text: 'MFA fatigue burst — 28 pushes/min for single account',      geo: 'RU · novel IP',  affected: '1 user',    status: 'blocked',    statusColor: 'var(--danger)' },
  { severity: 'critical', text: 'Impossible travel — approval from SF, then Lagos in 12 min', geo: 'US → NG',        affected: '1 user',    status: 'step-up',    statusColor: 'var(--warning)' },
  { severity: 'high',     text: 'Sub-300ms approve velocity on 12 consecutive pushes',        geo: 'DE',             affected: '1 user',    status: 'flagged',    statusColor: 'var(--warning)' },
  { severity: 'high',     text: 'Bulk enrollment — 47 accounts from 1 install_id in 90s',    geo: 'datacenter IP',  affected: '1 device',  status: 'blocked',    statusColor: 'var(--danger)' },
  { severity: 'high',     text: 'TLS cert pinning bypass attempts cluster',                   geo: 'TR · 23 IPs',    affected: '23 devices',status: 'monitoring', statusColor: 'var(--warning)' },
]

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSecurityData() {
  const kpisResult      = useDocument<SecKpis>('analytics/security/kpis/current')
  const threatsResult   = useCollection<ThreatPoint>('analytics/security/threats', 'order')
  const integrityResult = useCollection<IntegrityItem>('analytics/security/integrity', 'order')
  const eventsResult    = useCollection<SecEvent>('analytics/security/events', 'order')

  const loading =
    kpisResult.loading || threatsResult.loading ||
    integrityResult.loading || eventsResult.loading

  return {
    loading,
    kpis:      kpisResult.data      ?? MOCK_KPIS,
    threats:   threatsResult.data   ?? MOCK_THREATS,
    integrity: integrityResult.data ?? MOCK_INTEGRITY,
    events:    eventsResult.data    ?? MOCK_EVENTS,
  }
}
