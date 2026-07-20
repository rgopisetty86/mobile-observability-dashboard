import { useRef, useState } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useSecurityData, resolveColor, severityBadge } from '../hooks/useSecurityData'

export default function SecurityDashboard() {
  const c = useChartColors()
  const { loading, kpis, threats, integrity, events } = useSecurityData()
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null)
  const eventsRef = useRef<HTMLDivElement>(null)

  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const placeholder = loading ? '—' : null

  const toggleSeverity = (badge: string) =>
    setActiveSeverity(prev => (prev === badge ? null : badge))

  const visibleEvents = activeSeverity
    ? events.filter(e => severityBadge(e.severity) === activeSeverity)
    : events

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Threat detection</div>
        <div className="dash-subtitle">
          Security operations · last 24h
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>syncing…</span>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          className="badge badge-danger"
          style={{ fontSize: 11, padding: '4px 10px', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          onClick={() => eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          title="Jump to security events table"
        >
          ● {placeholder ?? kpis.activeInvestigations} active investigations
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">MFA fatigue blocked</div>
          <div className="kpi-value warning">{placeholder ?? kpis.mfaFatigue}</div>
          <div className="kpi-delta delta-down">↑ 142% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Geo impossibilities</div>
          <div className="kpi-value">{placeholder ?? kpis.geoImpossibilities}</div>
          <div className="kpi-delta delta-flat">flat vs baseline</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Integrity violations</div>
          <div className="kpi-value">{placeholder ?? kpis.integrityViolations}</div>
          <div className="kpi-delta delta-up">↓ 6% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Accounts locked</div>
          <div className="kpi-value">{placeholder ?? kpis.accountsLocked}</div>
          <div className="kpi-delta delta-warn">↑ 38% (correlates w/ fatigue)</div>
        </div>
      </div>

      {/* Threat chart + Integrity breakdown */}
      <div className="grid grid-asym-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Threat events over 24h</div>
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threats} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c.danger} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c.danger} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="integrityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c.warning} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c.warning} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="geoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c.purple} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="time" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconSize={10} iconType="circle"
                  formatter={value => (
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', color: c.text }}>
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 12 }}
                />
                <Area dataKey="fatigue"   name="MFA fatigue"         stroke={c.danger}  strokeWidth={1.5} fill="url(#fatigueGrad)"   dot={false} />
                <Area dataKey="integrity" name="Integrity violations" stroke={c.warning} strokeWidth={1.5} fill="url(#integrityGrad)" dot={false} />
                <Area dataKey="geo"       name="Geo anomalies"        stroke={c.purple}  strokeWidth={1.5} fill="url(#geoGrad)"       dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Integrity violations</div>
          {integrity.map(item => (
            <div key={item.label} className="adopt-row">
              <div className="adopt-head">
                <span>{item.label}</span>
                <span className="num">{item.count}</span>
              </div>
              <div className="adopt-track">
                <div
                  className="adopt-fill"
                  style={{ width: `${item.width}%`, background: resolveColor(item.colorToken) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events Table */}
      <div className="panel" ref={eventsRef}>
        <div className="panel-title">
          <span>High-severity security events</span>
          <a className="panel-action" href="#">open in SIEM ↗</a>
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
              <th>Pattern</th>
              <th style={{ width: 120 }}>Geo</th>
              <th style={{ width: 80 }}>Affected</th>
              <th style={{ width: 80, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.map((e, i) => (
              <tr key={i}>
                <td>
                  <button
                    className={`badge ${severityBadge(e.severity)}`}
                    onClick={() => toggleSeverity(severityBadge(e.severity))}
                    title={activeSeverity === severityBadge(e.severity) ? 'Clear filter' : `Filter by ${e.severity}`}
                    style={{
                      cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      outline: activeSeverity === severityBadge(e.severity) ? '2px solid currentColor' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {e.severity}
                  </button>
                </td>
                <td>{e.text}</td>
                <td className="mono" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{e.geo}</td>
                <td>{e.affected}</td>
                <td style={{ textAlign: 'right', color: e.statusColor }}>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
