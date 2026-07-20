import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useSREData, resolveColorToken } from '../hooks/useSREData'

type GoldenSignal = 'latency' | 'traffic' | 'errors' | 'saturation'

const goldenSignals: { key: GoldenSignal; label: string; color: string; description: string }[] = [
  { key: 'latency',    label: 'Latency',    color: 'var(--accent)',   description: 'How long requests take' },
  { key: 'traffic',    label: 'Traffic',    color: 'var(--teal)',     description: 'Demand on the system' },
  { key: 'errors',     label: 'Errors',     color: 'var(--danger)',   description: 'Rate of failed requests' },
  { key: 'saturation', label: 'Saturation', color: 'var(--warning)',  description: 'How "full" the service is' },
]

const panelSignals: Record<string, GoldenSignal[]> = {
  kpi_crash:      ['errors'],
  kpi_api:        ['errors'],
  kpi_push:       ['traffic'],
  kpi_ttc:        ['latency'],
  burn:           ['traffic', 'saturation'],
  chart_latency:  ['latency'],
  deps:           ['latency', 'saturation'],
  alerts:         ['errors'],
}

export default function SREDashboard() {
  const c = useChartColors()
  const { loading, kpis, latency, burn, deps, alerts } = useSREData()
  const [activeSeverity, setActiveSeverity] = React.useState<string | null>(null)
  const [selectedDep, setSelectedDep] = React.useState<string | null>(null)
  const [activeSignal, setActiveSignal] = React.useState<GoldenSignal | null>(null)

  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const placeholder = loading ? '—' : null

  const visibleAlerts = activeSeverity
    ? alerts.filter(a => a.badge === activeSeverity)
    : alerts

  const toggleSeverity = (badge: string) =>
    setActiveSeverity(prev => (prev === badge ? null : badge))

  const toggleDep = (name: string) =>
    setSelectedDep(prev => (prev === name ? null : name))

  const toggleSignal = (sig: GoldenSignal) =>
    setActiveSignal(prev => (prev === sig ? null : sig))

  // Returns inline style that dims a panel when it doesn't belong to the active signal
  const dim = (panelKey: string): React.CSSProperties => {
    if (!activeSignal) return {}
    const belongs = panelSignals[panelKey]?.includes(activeSignal) ?? false
    return {
      opacity: belongs ? 1 : 0.25,
      filter: belongs ? 'none' : 'saturate(0.2)',
      transition: 'opacity 0.2s, filter 0.2s',
    }
  }

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Service health overview</div>
        <div className="dash-subtitle">
          Real-time view for on-call · auto-refresh 30s
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>syncing…</span>}
        </div>
      </div>

      {/* Golden Signals Filter */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        {goldenSignals.map(sig => {
          const isActive = activeSignal === sig.key
          return (
            <button
              key={sig.key}
              className={`filter-pill${isActive ? ' active' : ''}`}
              onClick={() => toggleSignal(sig.key)}
              title={sig.description}
              style={isActive ? {
                borderColor: sig.color,
                color: sig.color,
                background: 'var(--accent-soft)',
                outline: `1px solid ${sig.color}`,
              } : {}}
            >
              {isActive ? '● ' : ''}{sig.label}
            </button>
          )
        })}
        {activeSignal && (
          <button
            onClick={() => setActiveSignal(null)}
            style={{
              fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)',
              background: 'none', border: 'none', padding: '0 6px',
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          >
            ✕ clear
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi" style={dim('kpi_crash')}>
          <div className="kpi-label">Crash-free sessions</div>
          <div className="kpi-value success">{placeholder ?? kpis.crashFree}</div>
          <div className="kpi-delta delta-flat">SLO 99.95% · 28d</div>
        </div>
        <div className="kpi" style={dim('kpi_api')}>
          <div className="kpi-label">API availability</div>
          <div className="kpi-value success">{placeholder ?? kpis.apiAvail}</div>
          <div className="kpi-delta delta-flat">SLO 99.95% · 28d</div>
        </div>
        <div className="kpi" style={dim('kpi_push')}>
          <div className="kpi-label">Push delivery</div>
          <div className="kpi-value warning">{placeholder ?? kpis.pushDelivery}</div>
          <div className="kpi-delta delta-warn">SLO 99.5% · 7d</div>
        </div>
        <div className="kpi" style={dim('kpi_ttc')}>
          <div className="kpi-label">Time-to-code p95</div>
          <div className="kpi-value success">{placeholder ?? kpis.timeToCode}</div>
          <div className="kpi-delta delta-flat">SLO &lt;1.5s · 7d</div>
        </div>
      </div>

      {/* SLO Burn Rates */}
      <div className="panel" style={dim('burn')}>
        <div className="panel-title">SLO burn rates (1h window)</div>
        <div className="burn-grid">
          {burn.map(b => (
            <div key={b.label}>
              <div className="burn-label">{b.label}</div>
              <div className="burn-bar">
                <div className="burn-fill" style={{ width: b.width, background: resolveColorToken(b.colorToken) }} />
              </div>
              <div className="burn-value" style={{ color: resolveColorToken(b.colorToken) }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Dependencies */}
      <div className="grid grid-asym-2 row-gap">
        <div className="panel" style={{ marginTop: 0, ...dim('chart_latency') }}>
          <div className="panel-title">Push E2E latency (p50 / p95 / p99)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latency} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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

        <div className="panel" style={{ marginTop: 0, ...dim('deps') }}>
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
      <div className="panel" style={dim('alerts')}>
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
