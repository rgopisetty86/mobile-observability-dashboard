import { useDocument, useCollection } from './useFirestore'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ExecKpis {
  mau:          string  // e.g. "4.2M"
  installs:     string  // e.g. "412k"
  d30Retention: string  // e.g. "67%"
  nps:          string  // e.g. "62"
  rating:       string  // e.g. "4.7★"
}

export interface MauGrowthPoint {
  month:  string   // e.g. "Jun", "May"
  mau:    number   // millions
  order?: number
}

export interface ScorecardItem {
  label:      string
  value:      string
  colorToken?: string  // "success" | "warning" | "danger" | undefined
  order?:     number
}

export interface PlatformMixItem {
  label:      string
  pct:        number
  colorToken: string   // "accent" | "teal"
  order?:     number
}

export interface RegionItem {
  label:  string
  value:  string
  order?: number
}

// ── Color token resolver ───────────────────────────────────────────────────

export function resolveScorecardColor(token?: string): string | undefined {
  if (!token) return undefined
  const map: Record<string, string> = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger:  'var(--danger)',
    accent:  'var(--accent)',
    teal:    'var(--teal)',
  }
  return map[token] ?? token
}

// ── Fallback mock data ─────────────────────────────────────────────────────

const MOCK_KPIS: ExecKpis = {
  mau:          '4.2M',
  installs:     '412k',
  d30Retention: '67%',
  nps:          '62',
  rating:       '4.7★',
}

const MOCK_MAU_GROWTH: MauGrowthPoint[] = [
  { month: 'Jun', mau: 2.1 }, { month: 'Jul', mau: 2.3 },
  { month: 'Aug', mau: 2.5 }, { month: 'Sep', mau: 2.7 },
  { month: 'Oct', mau: 2.9 }, { month: 'Nov', mau: 3.1 },
  { month: 'Dec', mau: 3.3 }, { month: 'Jan', mau: 3.5 },
  { month: 'Feb', mau: 3.7 }, { month: 'Mar', mau: 3.9 },
  { month: 'Apr', mau: 4.0 }, { month: 'May', mau: 4.2 },
]

const MOCK_RELIABILITY: ScorecardItem[] = [
  { label: 'Overall availability',      value: '99.94%', colorToken: 'success' },
  { label: 'SLOs met',                  value: '8 of 10' },
  { label: 'Major incidents (SEV1/2)',   value: '1' },
  { label: 'MTTR (median)',              value: '38 min' },
  { label: 'Crash-free sessions',        value: '99.95%', colorToken: 'success' },
]

const MOCK_SECURITY: ScorecardItem[] = [
  { label: 'Threats blocked (month)',    value: '142k' },
  { label: 'Confirmed ATO incidents',    value: '0',   colorToken: 'success' },
  { label: 'Phishing-resistant auth %',  value: '11%' },
  { label: 'Users with biometric lock',  value: '78%' },
  { label: 'Critical vulns open',        value: '0',   colorToken: 'success' },
]

const MOCK_PLATFORM_MIX: PlatformMixItem[] = [
  { label: 'iOS',     pct: 58, colorToken: 'accent' },
  { label: 'Android', pct: 42, colorToken: 'teal' },
]

const MOCK_REGIONS: RegionItem[] = [
  { label: 'North America', value: '38%' },
  { label: 'Europe',        value: '31%' },
  { label: 'Asia Pacific',  value: '22%' },
  { label: 'Rest of world', value: '9%' },
]

const MOCK_UNIT_ECON: ScorecardItem[] = [
  { label: 'Infra cost / MAU',      value: '$0.08' },
  { label: 'Trend',                 value: '↓ 12% YoY', colorToken: 'success' },
  { label: 'Support tix / 1k MAU',  value: '2.3' },
  { label: 'Trend',                 value: '↓ 8% MoM',  colorToken: 'success' },
]

// ── Hook ───────────────────────────────────────────────────────────────────

export function useExecutiveData() {
  const kpisResult        = useDocument<ExecKpis>('analytics/executive/kpis/current')
  const mauGrowthResult   = useCollection<MauGrowthPoint>('analytics/executive/mauGrowth', 'order')
  const reliabilityResult = useCollection<ScorecardItem>('analytics/executive/reliability', 'order')
  const securityResult    = useCollection<ScorecardItem>('analytics/executive/security', 'order')
  const platformResult    = useCollection<PlatformMixItem>('analytics/executive/platformMix', 'order')
  const regionsResult     = useCollection<RegionItem>('analytics/executive/regions', 'order')
  const unitEconResult    = useCollection<ScorecardItem>('analytics/executive/unitEcon', 'order')

  const loading =
    kpisResult.loading || mauGrowthResult.loading || reliabilityResult.loading ||
    securityResult.loading || platformResult.loading || regionsResult.loading ||
    unitEconResult.loading

  return {
    loading,
    kpis:        kpisResult.data        ?? MOCK_KPIS,
    mauGrowth:   mauGrowthResult.data   ?? MOCK_MAU_GROWTH,
    reliability: reliabilityResult.data ?? MOCK_RELIABILITY,
    security:    securityResult.data    ?? MOCK_SECURITY,
    platformMix: platformResult.data    ?? MOCK_PLATFORM_MIX,
    regions:     regionsResult.data     ?? MOCK_REGIONS,
    unitEcon:    unitEconResult.data    ?? MOCK_UNIT_ECON,
  }
}
