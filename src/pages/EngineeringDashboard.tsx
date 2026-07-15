import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useEngineeringData } from '../hooks/useEngineeringData'

// ── Types ──────────────────────────────────────────────────────────────────

type FilterKey = 'platform' | 'version' | 'os' | 'deviceTier'

interface FilterState {
  platform: string
  version:  string
  os:       string
  deviceTier: string
}

interface DropdownOption { label: string; value: string }

// ── FilterPill ─────────────────────────────────────────────────────────────

function FilterPill({
  label, value, options, isOpen, onToggle, onChange,
}: {
  label: string
  value: string
  options: DropdownOption[]
  isOpen: boolean
  onToggle: () => void
  onChange: (v: string) => void
}) {
  const isActive = value !== 'all'
  const display = isActive ? `${label}: ${value}` : `${label}: all`

  return (
    <div style={{ position: 'relative' }}>
      <button
        className={`filter-pill${isActive ? ' active' : ''}`}
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {display}
        <span style={{ opacity: 0.5, fontSize: 9 }}>▾</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          padding: '4px 0',
          minWidth: 160,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); onToggle() }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 14px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 12,
                fontFamily: 'IBM Plex Mono, monospace',
                color: opt.value === value ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: opt.value === value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Static filter option definitions ──────────────────────────────────────

const PLATFORM_OPTS: DropdownOption[] = [
  { label: 'all platforms', value: 'all' },
  { label: 'iOS',           value: 'iOS' },
  { label: 'Android',       value: 'Android' },
]

const OS_OPTS: DropdownOption[] = [
  { label: 'all OS versions', value: 'all' },
  { label: 'iOS 17',          value: 'iOS 17' },
  { label: 'Android 12',      value: 'Android 12' },
  { label: 'Android 14',      value: 'Android 14' },
]

const DEVICE_TIER_OPTS: DropdownOption[] = [
  { label: 'all device tiers', value: 'all' },
  { label: 'high-tier',        value: 'high' },
  { label: 'low-tier',         value: 'low' },
]

// ── Stack trace ────────────────────────────────────────────────────────────

const stackTrace = `Thread 0 Crashed:
0   Authenticator   0x0000000104b2c1d4   <span class="crash-frame">KeychainStore.fetchSecret(_:) + 84</span>
1   Authenticator   0x0000000104b1f8a0   AccountStore.totp(for:) + 120
2   Authenticator   0x0000000104b0a2c8   HomeViewModel.refreshCodes() + 248
3   Authenticator   0x0000000104afe410   HomeView.body.getter + 312
4   SwiftUI         0x00000001a8c4d918   <span class="sys-frame">ViewRendererHost.layoutSubviews() + 96</span>
5   UIKitCore       0x00000001892b1240   <span class="sys-frame">UIView.layoutIfNeeded() + 188</span>`

// ── Component ──────────────────────────────────────────────────────────────

export default function EngineeringDashboard() {
  const c = useChartColors()
  const { loading, kpis, signatures, versions, trend } = useEngineeringData()

  const [filters, setFilters] = useState<FilterState>({
    platform: 'all', version: 'all', os: 'all', deviceTier: 'all',
  })
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const filterRowRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRowRef.current && !filterRowRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const setFilter = (key: FilterKey) => (value: string) =>
    setFilters(f => ({ ...f, [key]: value }))

  const toggleFilter = (key: FilterKey) =>
    setOpenFilter(prev => prev === key ? null : key)

  // Version options derived from live data
  const versionOpts: DropdownOption[] = [
    { label: 'all versions', value: 'all' },
    ...versions.map(v => ({ label: v.version, value: v.version })),
  ]

  // ── Filter logic ─────────────────────────────────────────────────────────

  const filteredSignatures = signatures.filter(sig => {
    if (filters.platform !== 'all' && !sig.platform.includes(filters.platform)) return false
    if (filters.os !== 'all' && !sig.platform.includes(filters.os)) return false
    if (filters.deviceTier === 'low' && !sig.platform.includes('low-tier')) return false
    if (filters.deviceTier === 'high' && sig.platform.includes('low-tier')) return false
    return true
  })

  // Version filter highlights a bar; all bars still shown for context
  const barFill = (ver: string, i: number) => {
    if (filters.version !== 'all') return ver === filters.version ? c.danger : c.muted
    return i === versions.length - 1 ? c.danger : c.muted
  }

  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const placeholder = loading ? '—' : null

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Crash explorer</div>
        <div className="dash-subtitle">
          Release regression triage · last 24h
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>syncing…</span>}
        </div>
      </div>

      {/* Filters */}
      <div ref={filterRowRef} className="filter-row" style={{ marginBottom: 16, alignItems: 'center' }}>
        <FilterPill
          label="platform" value={filters.platform} options={PLATFORM_OPTS}
          isOpen={openFilter === 'platform'}
          onToggle={() => toggleFilter('platform')}
          onChange={setFilter('platform')}
        />
        <FilterPill
          label="version" value={filters.version} options={versionOpts}
          isOpen={openFilter === 'version'}
          onToggle={() => toggleFilter('version')}
          onChange={setFilter('version')}
        />
        <FilterPill
          label="os" value={filters.os} options={OS_OPTS}
          isOpen={openFilter === 'os'}
          onToggle={() => toggleFilter('os')}
          onChange={setFilter('os')}
        />
        <FilterPill
          label="device tier" value={filters.deviceTier} options={DEVICE_TIER_OPTS}
          isOpen={openFilter === 'deviceTier'}
          onToggle={() => toggleFilter('deviceTier')}
          onChange={setFilter('deviceTier')}
        />
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ platform: 'all', version: 'all', os: 'all', deviceTier: 'all' })}
            style={{
              marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'IBM Plex Mono, monospace',
              padding: '5px 8px',
            }}
          >
            clear all ✕
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Crash-free sessions</div>
          <div className="kpi-value">{placeholder ?? kpis.crashFree}</div>
          <div className="kpi-delta delta-down">↓ 0.06% vs v4.12.0</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">ANR-free sessions</div>
          <div className="kpi-value">{placeholder ?? kpis.anrFree}</div>
          <div className="kpi-delta delta-flat">flat vs prior</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Affected users (24h)</div>
          <div className="kpi-value">{placeholder ?? kpis.affectedUsers}</div>
          <div className="kpi-delta delta-down">↑ 38% week-over-week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">New signatures</div>
          <div className="kpi-value">{placeholder ?? kpis.newSignatures}</div>
          <div className="kpi-delta delta-warn">first seen in v4.12.1</div>
        </div>
      </div>

      {/* Top Crash Signatures */}
      <div className="panel">
        <div className="panel-title">
          <span>Top crash signatures</span>
          {activeFilterCount > 0 && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 400 }}>
              {filteredSignatures.length} of {signatures.length} shown
            </span>
          )}
        </div>
        {filteredSignatures.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
            No crashes match the active filters.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Signature</th>
                <th>Top frame</th>
                <th style={{ textAlign: 'right' }}>Count</th>
                <th style={{ textAlign: 'right' }}>Users</th>
                <th style={{ textAlign: 'right' }}>Δ 24h</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignatures.map(crash => (
                <tr key={crash.name} className={crash.highlight ? 'highlight' : ''}>
                  <td>
                    <div style={{ fontWeight: 500, color: crash.highlight ? 'var(--danger)' : 'inherit' }}>
                      {crash.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{crash.platform}</div>
                  </td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{crash.frame}</span></td>
                  <td className="num" style={{ fontWeight: crash.highlight ? 500 : 'normal' }}>{crash.count}</td>
                  <td className="num">{crash.users}</td>
                  <td className="num" style={{ color: crash.deltaColor, fontWeight: crash.highlight ? 500 : 'normal' }}>
                    {crash.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">
            Crash rate by app version
            {filters.version !== 'all' && (
              <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 400 }}>
                · {filters.version} highlighted
              </span>
            )}
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={versions} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="version" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(1)} />
                <Tooltip content={<ChartTooltip formatter={v => v.toFixed(1)} />} />
                <Bar dataKey="rate" radius={[3, 3, 0, 0]} maxBarSize={50}>
                  {versions.map((entry, i) => (
                    <Cell key={i} fill={barFill(entry.version, i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Crash-free sessions trend (14d)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="crashTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c.accent} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="day" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
                <YAxis
                  tick={tickStyle} axisLine={false} tickLine={false}
                  domain={[99.85, 100]}
                  tickFormatter={v => v.toFixed(2) + '%'}
                />
                <Tooltip content={<ChartTooltip formatter={v => v.toFixed(2) + '%'} />} />
                <Area
                  dataKey="rate" stroke={c.accent} strokeWidth={2}
                  fill="url(#crashTrendGrad)"
                  dot={{ r: 3, fill: c.accent, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stack trace */}
      <div className="panel">
        <div className="panel-title">
          <span>Selected: EXC_BAD_ACCESS in KeychainStore.fetchSecret</span>
          <a className="panel-action" href="#">open in Sentry ↗</a>
        </div>
        <div
          className="stack"
          dangerouslySetInnerHTML={{ __html: stackTrace }}
        />
        <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span>iPhone 14/15/16 series (98% of crashes)</span>
          <span>iOS 17.4–17.5 only</span>
          <span>first seen 2h after release</span>
        </div>
      </div>
    </section>
  )
}
