import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'

const pushLatencyData = [
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

const burnItems = [
  { label: 'Crash-free',    width: '8%',  value: '0.4× normal', color: 'var(--success)' },
  { label: 'API availability', width: '22%', value: '1.1× normal', color: 'var(--success)' },
  { label: 'Push delivery', width: '68%', value: '6.8× burning', color: 'var(--warning)' },
  { label: 'Time-to-code',  width: '14%', value: '0.7× normal', color: 'var(--success)' },
  { label: 'Backup success', width: '18%', value: '0.9× normal', color: 'var(--success)' },
]

const deps = [
  { name: 'APNs',        status: 'success', label: 'healthy',  value: '142ms' },
  { name: 'FCM',         status: 'warning', label: 'degraded', value: '890ms' },
  { name: 'Primary DB',  status: 'success', label: 'healthy',  value: '4ms' },
  { name: 'Redis cache', status: 'success', label: '',         value: '94.2% hit' },
  { name: 'Identity IdP',status: 'success', label: 'healthy',  value: '38ms' },
]

const alerts = [
  {
    badge: 'badge-danger', badgeLabel: 'page',
    text: 'Push delivery SLO burn 6.8× — FCM Asia region',
    age: '14m ago', action: 'runbook ↗',
  },
  {
    badge: 'badge-warning', badgeLabel: 'warn',
    text: 'FCM dispatch latency p99 elevated (890ms vs 200ms baseline)',
    age: '22m ago', action: 'runbook ↗',
  },
  {
    badge: 'badge-neutral', badgeLabel: 'info',
    text: 'Release v4.12.1 rollout at 47% (3.2M users)',
    age: '2h ago', action: 'details ↗',
  },
]

export default function SREDashboard() {
  const c = useChartColors()
  const [activeSeverity, setActiveSeverity] = React.useState<string | null>(null)
  const [selectedDep, setSelectedDep] = React.useState<string | null>(null)

  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }

  const visibleAlerts = activeSeverity
    ? alerts.filter(a => a.badge === activeSeverity)
    : alerts

  const toggleSeverity = (badge: string) =>
    setActiveSeverity(prev => (prev === badge ? null : badge))

  const toggleDep = (name: string) =>
    setSelectedDep(prev => (prev === name ? null : name))

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Service health overview</div>
        <div className="dash-subtitle">Real-time view for on-call · auto-refresh 30s</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Crash-free sessions</div>
          <div className="kpi-value success">99.97%</div>
          <div className="kpi-delta delta-flat">SLO 99.95% · 28d</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">API availability</div>
          <div className="kpi-value success">99.94%</div>
          <div className="kpi-delta delta-flat">SLO 99.95% · 28d</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Push delivery</div>
          <div className="kpi-value warning">99.62%</div>
          <div className="kpi-delta delta-warn">SLO 99.5% · 7d</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Time-to-code p95</div>
          <div className="kpi-value success">1.28s</div>
          <div className="kpi-delta delta-flat">SLO &lt;1.5s · 7d</div>
        </div>
      </div>

      {/* SLO Burn Rates */}
      <div className="panel">
        <div className="panel-title">SLO burn rates (1h window)</div>
        <div className="burn-grid">
          {burnItems.map(b => (
            <div key={b.label}>
              <div className="burn-label">{b.label}</div>
              <div className="burn-bar">
                <div className="burn-fill" style={{ width: b.width, background: b.color }} />
              </div>
              <div className="burn-value" style={{ color: b.color }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Dependencies */}
      <div className="grid grid-asym-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Push E2E latency (p50 / p95 / p99)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pushLatencyData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="time" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}s`} />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => `${v}s`} />}
                />
                <Legend
                  iconSize={10}
                  iconType="circle"
                  formatter={value => (
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', color: c.text }}>
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 12 }}
                />
                <Line dataKey="p50" stroke={c.muted}   strokeWidth={1.5} dot={false} />
                <Line dataKey="p95" stroke={c.accent}  strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line dataKey="p99" stroke={c.danger}  strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Dependencies</div>
          {deps.map(d => (
            <div
              key={d.name}
              className="dep-row"
              onClick={() => toggleDep(d.name)}
              title={selectedDep === d.name ? 'Deselect' : `Inspect ${d.name}`}
              style={{
                cursor: 'pointer',
                borderLeft: selectedDep === d.name ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: selectedDep === d.name ? 10 : 10,
                background: selectedDep === d.name ? 'var(--accent-soft)' : 'transparent',
                borderRadius: selectedDep === d.name ? 6 : 0,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <span>{d.name}</span>
              <span>
                <span className={`dot dot-${d.status}`} />
                {d.label && <span>{d.label} </span>}
                <span className="mono">{d.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="panel">
        <div className="panel-title">
          <span>Active alerts</span>
          <span style={{ color: 'var(--warning)', fontSize: 11 }}>2 firing</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 90 }}>
                Severity
                {activeSeverity && (
                  <button
                    onClick={() => setActiveSeverity(null)}
                    style={{
                      marginLeft: 6, fontSize: 10, cursor: 'pointer',
                      color: 'var(--text-secondary)', background: 'none',
                      border: 'none', padding: 0, fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                    title="Clear filter"
                  >
                    ✕ clear
                  </button>
                )}
              </th>
              <th>Alert</th>
              <th style={{ width: 100 }}>Age</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {visibleAlerts.map((a, i) => (
              <tr key={i}>
                <td>
                  <button
                    className={`badge ${a.badge}`}
                    onClick={() => toggleSeverity(a.badge)}
                    title={activeSeverity === a.badge ? 'Clear filter' : `Filter by ${a.badgeLabel}`}
                    style={{
                      cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      outline: activeSeverity === a.badge ? '2px solid currentColor' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {a.badgeLabel}
                  </button>
                </td>
                <td>{a.text}</td>
                <td className="mono" style={{ color: 'var(--text-secondary)' }}>{a.age}</td>
                <td><a className="panel-action" href="#">{a.action}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
