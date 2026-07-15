import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'

const mauGrowthData = [
  { month: 'Jun', mau: 2.1 },
  { month: 'Jul', mau: 2.3 },
  { month: 'Aug', mau: 2.5 },
  { month: 'Sep', mau: 2.7 },
  { month: 'Oct', mau: 2.9 },
  { month: 'Nov', mau: 3.1 },
  { month: 'Dec', mau: 3.3 },
  { month: 'Jan', mau: 3.5 },
  { month: 'Feb', mau: 3.7 },
  { month: 'Mar', mau: 3.9 },
  { month: 'Apr', mau: 4.0 },
  { month: 'May', mau: 4.2 },
]

const reliability = [
  { label: 'Overall availability',  value: '99.94%', color: 'var(--success)' },
  { label: 'SLOs met',              value: '8 of 10' },
  { label: 'Major incidents (SEV1/2)', value: '1' },
  { label: 'MTTR (median)',         value: '38 min' },
  { label: 'Crash-free sessions',   value: '99.95%', color: 'var(--success)' },
]

const security = [
  { label: 'Threats blocked (month)',   value: '142k' },
  { label: 'Confirmed ATO incidents',   value: '0',   color: 'var(--success)' },
  { label: 'Phishing-resistant auth %', value: '11%' },
  { label: 'Users with biometric lock', value: '78%' },
  { label: 'Critical vulns open',       value: '0',   color: 'var(--success)' },
]

const platformMix = [
  { label: 'iOS',     pct: 58, color: 'var(--accent)' },
  { label: 'Android', pct: 42, color: 'var(--teal)' },
]

const regions = [
  { label: 'North America', value: '38%' },
  { label: 'Europe',        value: '31%' },
  { label: 'Asia Pacific',  value: '22%' },
  { label: 'Rest of world', value: '9%' },
]

const unitEcon = [
  { label: 'Infra cost / MAU',   value: '$0.08' },
  { label: 'Trend',              value: '↓ 12% YoY', color: 'var(--success)' },
  { label: 'Support tix / 1k MAU', value: '2.3' },
  { label: 'Trend',              value: '↓ 8% MoM',  color: 'var(--success)' },
]

export default function ExecutiveDashboard() {
  const c = useChartColors()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">Executive summary</div>
        <div className="dash-subtitle">May 2026 · vs April 2026 · updated daily</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-5">
        <div className="kpi">
          <div className="kpi-label">MAU</div>
          <div className="kpi-value">4.2M</div>
          <div className="kpi-delta delta-up">↑ 8.4%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">New installs</div>
          <div className="kpi-value">412k</div>
          <div className="kpi-delta delta-up">↑ 14%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">D30 retention</div>
          <div className="kpi-value">67%</div>
          <div className="kpi-delta delta-up">↑ 3pp</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">NPS</div>
          <div className="kpi-value">62</div>
          <div className="kpi-delta delta-up">↑ 4 pts</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">App rating</div>
          <div className="kpi-value">4.7★</div>
          <div className="kpi-delta delta-flat">stable</div>
        </div>
      </div>

      {/* Reliability + Security scorecards */}
      <div className="grid grid-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Reliability scorecard</div>
          {reliability.map((r, i) => (
            <div key={i} className="score-row">
              <span className="score-label">{r.label}</span>
              <span className="score-value" style={r.color ? { color: r.color } : {}}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Security posture</div>
          {security.map((s, i) => (
            <div key={i} className="score-row">
              <span className="score-label">{s.label}</span>
              <span className="score-value" style={s.color ? { color: s.color } : {}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAU Growth Chart */}
      <div className="panel">
        <div className="panel-title">MAU growth (12 months)</div>
        <div className="chart-wrap short">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mauGrowthData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid stroke={c.grid} vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
              <YAxis
                tick={tickStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v.toFixed(1) + 'M'}
              />
              <Tooltip content={<ChartTooltip formatter={v => v.toFixed(1) + 'M'} />} />
              <Bar dataKey="mau" fill={c.accent} radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform mix + Regions + Unit economics */}
      <div className="grid grid-3 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Platform mix</div>
          {platformMix.map(p => (
            <div key={p.label} className="adopt-row">
              <div className="adopt-head">
                <span>{p.label}</span>
                <span className="num">{p.pct}%</span>
              </div>
              <div className="adopt-track">
                <div className="adopt-fill" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Top regions</div>
          {regions.map((r, i) => (
            <div key={i} className="score-row" style={{ padding: '5px 0' }}>
              <span>{r.label}</span>
              <span className="score-value">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Unit economics</div>
          {unitEcon.map((u, i) => (
            <div key={i} className="score-row" style={{ padding: '5px 0' }}>
              <span className="score-label">{u.label}</span>
              <span className="score-value" style={u.color ? { color: u.color } : {}}>{u.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
