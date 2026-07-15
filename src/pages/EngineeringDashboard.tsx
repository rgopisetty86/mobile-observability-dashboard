import {
  BarChart, Bar, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'

const crashByVersion = [
  { version: 'v4.10',   rate: 0.4 },
  { version: 'v4.11',   rate: 0.3 },
  { version: 'v4.12.0', rate: 0.4 },
  { version: 'v4.12.1', rate: 0.9 },
]

const crashTrendData = [
  { day: '-14d', rate: 99.97 },
  { day: '-12d', rate: 99.96 },
  { day: '-10d', rate: 99.97 },
  { day: '-8d',  rate: 99.96 },
  { day: '-6d',  rate: 99.97 },
  { day: '-4d',  rate: 99.96 },
  { day: '-2d',  rate: 99.95 },
  { day: 'today',rate: 99.91 },
]

const topCrashes = [
  {
    name: 'EXC_BAD_ACCESS', platform: 'iOS · 17.4+ only', highlight: true,
    frame: 'KeychainStore.fetchSecret(_:)',
    count: '1,247', users: '1,089',
    delta: '↑ NEW', deltaColor: 'var(--danger)',
  },
  {
    name: 'NullPointerException', platform: 'Android · all versions', highlight: false,
    frame: 'BiometricPrompt.authenticate',
    count: '684', users: '612',
    delta: '↑ 12%', deltaColor: 'var(--warning)',
  },
  {
    name: 'SIGSEGV', platform: 'Android · low-tier devices', highlight: false,
    frame: 'QRScannerView.onCameraFrame',
    count: '412', users: '398',
    delta: '↓ 8%', deltaColor: 'var(--success)',
  },
  {
    name: 'OutOfMemoryError', platform: 'Android 12', highlight: false,
    frame: 'AccountListAdapter.bindView',
    count: '203', users: '198',
    delta: 'flat', deltaColor: 'var(--text-secondary)',
  },
]

const stackTrace = `Thread 0 Crashed:
0   Authenticator   0x0000000104b2c1d4   <span class="crash-frame">KeychainStore.fetchSecret(_:) + 84</span>
1   Authenticator   0x0000000104b1f8a0   AccountStore.totp(for:) + 120
2   Authenticator   0x0000000104b0a2c8   HomeViewModel.refreshCodes() + 248
3   Authenticator   0x0000000104afe410   HomeView.body.getter + 312
4   SwiftUI         0x00000001a8c4d918   <span class="sys-frame">ViewRendererHost.layoutSubviews() + 96</span>
5   UIKitCore       0x00000001892b1240   <span class="sys-frame">UIView.layoutIfNeeded() + 188</span>`

export default function EngineeringDashboard() {
  const c = useChartColors()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Crash explorer</div>
        <div className="dash-subtitle">Release regression triage · last 24h</div>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <span className="filter-pill">platform: all</span>
        <span className="filter-pill active">version: 4.12.1</span>
        <span className="filter-pill">os: all</span>
        <span className="filter-pill">device tier: all</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Crash-free sessions</div>
          <div className="kpi-value">99.91%</div>
          <div className="kpi-delta delta-down">↓ 0.06% vs v4.12.0</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">ANR-free sessions</div>
          <div className="kpi-value">99.85%</div>
          <div className="kpi-delta delta-flat">flat vs prior</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Affected users (24h)</div>
          <div className="kpi-value">2,847</div>
          <div className="kpi-delta delta-down">↑ 38% week-over-week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">New signatures</div>
          <div className="kpi-value">3</div>
          <div className="kpi-delta delta-warn">first seen in v4.12.1</div>
        </div>
      </div>

      {/* Top Crash Signatures */}
      <div className="panel">
        <div className="panel-title">Top crash signatures</div>
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
            {topCrashes.map(crash => (
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
      </div>

      {/* Charts */}
      <div className="grid grid-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Crash rate by app version</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crashByVersion} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="version" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(1)} />
                <Tooltip content={<ChartTooltip formatter={v => v.toFixed(1)} />} />
                <Bar dataKey="rate" radius={[3, 3, 0, 0]} maxBarSize={50}>
                  {crashByVersion.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === crashByVersion.length - 1 ? c.danger : c.muted}
                    />
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
              <AreaChart data={crashTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
