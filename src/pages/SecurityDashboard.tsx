import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'

const threatData = [
  { time: '-24h', fatigue: 42,  integrity: 180, geo: 8 },
  { time: '-20h', fatigue: 38,  integrity: 195, geo: 12 },
  { time: '-16h', fatigue: 45,  integrity: 210, geo: 9 },
  { time: '-12h', fatigue: 41,  integrity: 198, geo: 11 },
  { time: '-8h',  fatigue: 58,  integrity: 220, geo: 10 },
  { time: '-4h',  fatigue: 184, integrity: 215, geo: 8 },
  { time: 'now',  fatigue: 312, integrity: 188, geo: 12 },
]

const integrityItems = [
  { label: 'Jailbreak / root',   count: 684, width: 53, color: 'var(--warning)' },
  { label: 'Debugger attached',  count: 312, width: 24, color: 'var(--warning)' },
  { label: 'TLS pinning bypass', count: 187, width: 15, color: 'var(--danger)' },
  { label: 'Frida hook detected',count: 68,  width: 5,  color: 'var(--danger)' },
  { label: 'Binary tampering',   count: 33,  width: 3,  color: 'var(--danger)' },
]

const secEvents = [
  {
    badge: 'badge-danger', badgeLabel: 'critical',
    text: 'MFA fatigue burst — 28 pushes/min for single account',
    geo: 'RU · novel IP', affected: '1 user', status: 'blocked', statusColor: 'var(--danger)',
  },
  {
    badge: 'badge-danger', badgeLabel: 'critical',
    text: 'Impossible travel — approval from SF, then Lagos in 12 min',
    geo: 'US → NG', affected: '1 user', status: 'step-up', statusColor: 'var(--warning)',
  },
  {
    badge: 'badge-warning', badgeLabel: 'high',
    text: 'Sub-300ms approve velocity on 12 consecutive pushes',
    geo: 'DE', affected: '1 user', status: 'flagged', statusColor: 'var(--warning)',
  },
  {
    badge: 'badge-warning', badgeLabel: 'high',
    text: 'Bulk enrollment — 47 accounts from 1 install_id in 90s',
    geo: 'datacenter IP', affected: '1 device', status: 'blocked', statusColor: 'var(--danger)',
  },
  {
    badge: 'badge-warning', badgeLabel: 'high',
    text: 'TLS cert pinning bypass attempts cluster',
    geo: 'TR · 23 IPs', affected: '23 devices', status: 'monitoring', statusColor: 'var(--warning)',
  },
]

export default function SecurityDashboard() {
  const c = useChartColors()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Threat detection</div>
        <div className="dash-subtitle">Security operations · last 24h</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span className="badge badge-danger" style={{ fontSize: 11, padding: '4px 10px' }}>
          ● 3 active investigations
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">MFA fatigue blocked</div>
          <div className="kpi-value warning">847</div>
          <div className="kpi-delta delta-down">↑ 142% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Geo impossibilities</div>
          <div className="kpi-value">62</div>
          <div className="kpi-delta delta-flat">flat vs baseline</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Integrity violations</div>
          <div className="kpi-value">1,284</div>
          <div className="kpi-delta delta-up">↓ 6% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Accounts locked</div>
          <div className="kpi-value">93</div>
          <div className="kpi-delta delta-warn">↑ 38% (correlates w/ fatigue)</div>
        </div>
      </div>

      {/* Threat chart + Integrity */}
      <div className="grid grid-asym-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Threat events over 24h</div>
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
          {integrityItems.map(item => (
            <div key={item.label} className="adopt-row">
              <div className="adopt-head">
                <span>{item.label}</span>
                <span className="num">{item.count}</span>
              </div>
              <div className="adopt-track">
                <div className="adopt-fill" style={{ width: `${item.width}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events Table */}
      <div className="panel">
        <div className="panel-title">
          <span>High-severity security events</span>
          <a className="panel-action" href="#">open in SIEM ↗</a>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Severity</th>
              <th>Pattern</th>
              <th style={{ width: 120 }}>Geo</th>
              <th style={{ width: 80 }}>Affected</th>
              <th style={{ width: 80, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {secEvents.map((e, i) => (
              <tr key={i}>
                <td><span className={`badge ${e.badge}`}>{e.badgeLabel}</span></td>
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
