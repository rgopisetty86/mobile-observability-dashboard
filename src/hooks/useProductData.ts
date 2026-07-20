import { useDocument, useCollection } from './useFirestore'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProductKpis {
  mau:         string  // e.g. "4.2M"
  dau:         string  // e.g. "1.8M"
  stickiness:  string  // e.g. "43%"
  d30Retention:string  // e.g. "67%"
}

export interface MauTrendPoint {
  day:    string   // e.g. "-90d", "today"
  mau:    number   // millions, e.g. 4.2
  order?: number
}

export interface FunnelStep {
  label:          string   // e.g. "Camera permission granted"
  pct:            number   // 0–100
  count:          string   // formatted e.g. "116,862"
  drop:           string   // e.g. "−9%" or "—"
  dropColorToken: string   // "success" | "danger" | "muted"
  order?:         number
}

export interface FeatureAdoptionItem {
  label:  string
  pct:    number
  order?: number
}

export interface AuthMixSlice {
  name:   string   // e.g. "TOTP 58%"
  value:  number   // percentage
  order?: number
}

// ── Color token resolver ───────────────────────────────────────────────────

export function resolveDropColor(token: string): string {
  const map: Record<string, string> = {
    success: 'var(--success)',
    danger:  'var(--danger)',
    muted:   'var(--text-secondary)',
    neutral: 'var(--text-tertiary)',
  }
  return map[token] ?? token
}

// ── Fallback mock data ─────────────────────────────────────────────────────

const MOCK_KPIS: ProductKpis = {
  mau:          '4.2M',
  dau:          '1.8M',
  stickiness:   '43%',
  d30Retention: '67%',
}

const MOCK_MAU_TREND: MauTrendPoint[] = [
  { day: '-90d',  mau: 3.6 },
  { day: '-75d',  mau: 3.7 },
  { day: '-60d',  mau: 3.8 },
  { day: '-45d',  mau: 3.85 },
  { day: '-30d',  mau: 3.95 },
  { day: '-15d',  mau: 4.05 },
  { day: 'today', mau: 4.2 },
]

const MOCK_FUNNEL: FunnelStep[] = [
  { label: 'Opened add-account flow',   pct: 100, count: '128,420', drop: '—',    dropColorToken: 'neutral' },
  { label: 'Camera permission granted', pct: 91,  count: '116,862', drop: '−9%',  dropColorToken: 'success' },
  { label: 'QR scanned successfully',   pct: 73,  count: '93,747',  drop: '−20%', dropColorToken: 'danger'  },
  { label: 'Account confirmed',         pct: 69,  count: '88,610',  drop: '−5%',  dropColorToken: 'muted'   },
  { label: 'First code generated',      pct: 68,  count: '87,326',  drop: '−1%',  dropColorToken: 'muted'   },
  { label: 'Backup enabled',            pct: 31,  count: '39,810',  drop: '−54%', dropColorToken: 'danger'  },
]

const MOCK_FEATURE_ADOPTION: FeatureAdoptionItem[] = [
  { label: 'Cloud backup',     pct: 62 },
  { label: 'Biometric lock',   pct: 78 },
  { label: 'Cross-device sync',pct: 34 },
  { label: 'Passkey support',  pct: 12 },
  { label: 'Widget / watch',   pct: 8  },
]

const MOCK_AUTH_MIX: AuthMixSlice[] = [
  { name: 'TOTP 58%',         value: 58 },
  { name: 'Push approve 31%', value: 31 },
  { name: 'Passkey 11%',      value: 11 },
]

// ── Hook ───────────────────────────────────────────────────────────────────

export function useProductData() {
  const kpisResult     = useDocument<ProductKpis>('analytics/product/kpis/current')
  const mauTrendResult = useCollection<MauTrendPoint>('analytics/product/mauTrend', 'order')
  const funnelResult   = useCollection<FunnelStep>('analytics/product/funnel', 'order')
  const adoptionResult = useCollection<FeatureAdoptionItem>('analytics/product/featureAdoption', 'order')
  const authMixResult  = useCollection<AuthMixSlice>('analytics/product/authMix', 'order')

  const loading =
    kpisResult.loading || mauTrendResult.loading || funnelResult.loading ||
    adoptionResult.loading || authMixResult.loading

  return {
    loading,
    kpis:          kpisResult.data     ?? MOCK_KPIS,
    mauTrend:      mauTrendResult.data ?? MOCK_MAU_TREND,
    funnelSteps:   funnelResult.data   ?? MOCK_FUNNEL,
    featureAdoption: adoptionResult.data ?? MOCK_FEATURE_ADOPTION,
    authMix:       authMixResult.data  ?? MOCK_AUTH_MIX,
  }
}
