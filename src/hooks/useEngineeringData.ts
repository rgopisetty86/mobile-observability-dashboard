import { useDocument, useCollection } from './useFirestore'

// ── Types ──────────────────────────────────────────────────────────────────

export interface EngKpis {
  crashFree: string      // e.g. "99.91%"
  anrFree: string        // e.g. "99.85%"
  affectedUsers: string  // e.g. "2,847"
  newSignatures: number
}

export interface CrashSignature {
  name: string
  platform: string
  frame: string
  count: string
  users: string
  delta: string
  deltaColor: string
  highlight: boolean
}

export interface CrashByVersion {
  version: string
  rate: number
  order?: number
}

export interface CrashTrendPoint {
  day: string
  rate: number
  order?: number
}

// ── Fallback mock data (shown while loading or when Firebase is unconfigured) ─

const MOCK_KPIS: EngKpis = {
  crashFree:     '99.91%',
  anrFree:       '99.85%',
  affectedUsers: '2,847',
  newSignatures: 3,
}

const MOCK_SIGNATURES: CrashSignature[] = [
  { name: 'EXC_BAD_ACCESS',     platform: 'iOS · 17.4+ only',         highlight: true,  frame: 'KeychainStore.fetchSecret(_:)',     count: '1,247', users: '1,089', delta: '↑ NEW', deltaColor: 'var(--danger)' },
  { name: 'NullPointerException',platform: 'Android · all versions',   highlight: false, frame: 'BiometricPrompt.authenticate',      count: '684',   users: '612',   delta: '↑ 12%', deltaColor: 'var(--warning)' },
  { name: 'SIGSEGV',            platform: 'Android · low-tier devices',highlight: false, frame: 'QRScannerView.onCameraFrame',       count: '412',   users: '398',   delta: '↓ 8%',  deltaColor: 'var(--success)' },
  { name: 'OutOfMemoryError',   platform: 'Android 12',                highlight: false, frame: 'AccountListAdapter.bindView',       count: '203',   users: '198',   delta: 'flat',  deltaColor: 'var(--text-secondary)' },
]

const MOCK_VERSIONS: CrashByVersion[] = [
  { version: 'v4.10',   rate: 0.4 },
  { version: 'v4.11',   rate: 0.3 },
  { version: 'v4.12.0', rate: 0.4 },
  { version: 'v4.12.1', rate: 0.9 },
]

const MOCK_TREND: CrashTrendPoint[] = [
  { day: '-14d',  rate: 99.97 },
  { day: '-12d',  rate: 99.96 },
  { day: '-10d',  rate: 99.97 },
  { day: '-8d',   rate: 99.96 },
  { day: '-6d',   rate: 99.97 },
  { day: '-4d',   rate: 99.96 },
  { day: '-2d',   rate: 99.95 },
  { day: 'today', rate: 99.91 },
]

// ── Hook ───────────────────────────────────────────────────────────────────

export function useEngineeringData() {
  const kpisResult      = useDocument<EngKpis>('analytics/crashes/kpis/current')
  const signaturesResult= useCollection<CrashSignature>('analytics/crashes/signatures', 'order')
  const versionsResult  = useCollection<CrashByVersion>('analytics/crashes/versions', 'order')
  const trendResult     = useCollection<CrashTrendPoint>('analytics/crashes/trend', 'order')

  const loading =
    kpisResult.loading || signaturesResult.loading ||
    versionsResult.loading || trendResult.loading

  return {
    loading,
    kpis:       kpisResult.data       ?? MOCK_KPIS,
    signatures: signaturesResult.data ?? MOCK_SIGNATURES,
    versions:   versionsResult.data   ?? MOCK_VERSIONS,
    trend:      trendResult.data      ?? MOCK_TREND,
  }
}
