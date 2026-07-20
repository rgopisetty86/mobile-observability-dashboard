import { useState } from 'react'
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'

const mauTrendData = [
  { day: '-90d', mau: 3.6 },
  { day: '-75d', mau: 3.7 },
  { day: '-60d', mau: 3.8 },
  { day: '-45d', mau: 3.85 },
  { day: '-30d', mau: 3.95 },
  { day: '-15d', mau: 4.05 },
  { day: 'today',mau: 4.2 },
]

const authMixData = [
  { name: 'TOTP 58%',        value: 58 },
  { name: 'Push approve 31%',value: 31 },
  { name: 'Passkey 11%',     value: 11 },
]

const funnelSteps = [
  { label: 'Opened add-account flow',  pct: 100, count: '128,420', drop: '—',   dropColor: 'var(--text-tertiary)' },
  { label: 'Camera permission granted',pct: 91,  count: '116,862', drop: '−9%', dropColor: 'var(--success)' },
  { label: 'QR scanned successfully',  pct: 73,  count: '93,747',  drop: '−20%',dropColor: 'var(--danger)' },
  { label: 'Account confirmed',         pct: 69,  count: '88,610',  drop: '−5%', dropColor: 'var(--text-secondary)' },
  { label: 'First code generated',      pct: 68,  count: '87,326',  drop: '−1%', dropColor: 'var(--text-secondary)' },
  { label: 'Backup enabled',            pct: 31,  count: '39,810',  drop: '−54%',dropColor: 'var(--danger)' },
]

const featureAdoption = [
  { label: 'Cloud backup',    pct: 62 },
  { label: 'Biometric lock',  pct: 78 },
  { label: 'Cross-device sync',pct: 34 },
  { label: 'Passkey support', pct: 12 },
  { label: 'Widget / watch',  pct: 8  },
]

export default function ProductDashboard() {
  const c = useChartColors()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const authColors = [c.accent, c.success, c.purple]
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">North star &amp; enrollment</div>
        <div className="dash-subtitle">Product leadership review · last 30 days vs prior 30</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Monthly active users</div>
          <div className="kpi-value">4.2M</div>
          <div className="kpi-delta delta-up">↑ 8.4% MoM</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Daily active users</div>
          <div className="kpi-value">1.8M</div>
          <div className="kpi-delta delta-up">↑ 6.1% MoM</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">DAU / MAU stickiness</div>
          <div className="kpi-value">43%</div>
          <div className="kpi-delta delta-flat">flat (target 40%+)</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">D30 retention</div>
          <div className="kpi-value">67%</div>
          <div className="kpi-delta delta-up">↑ 3pp MoM</div>
        </div>
      </div>

      {/* MAU Trend */}
      <div className="panel">
        <div className="panel-title">MAU trend (90 days)</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mauTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={c.accent} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.grid} vertical={false} />
              <XAxis dataKey="day" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
              <YAxis
                tick={tickStyle} axisLine={false} tickLine={false}
                domain={[3.4, 'auto']}
                tickFormatter={v => v.toFixed(1) + 'M'}
              />
              <Tooltip content={<ChartTooltip formatter={v => v.toFixed(2) + 'M'} />} />
              <Area
                dataKey="mau" stroke={c.accent} strokeWidth={2}
                fill="url(#mauGrad)"
                dot={{ r: 3, fill: c.accent, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment Funnel */}
      <div className="panel">
        <div className="panel-title">Enrollment funnel · last 7 days</div>
        {funnelSteps.map(step => (
          <div
            key={step.label}
            className="funnel-row"
            onClick={() => setSelectedStep(prev => prev === step.label ? null : step.label)}
            title={selectedStep === step.label ? 'Deselect step' : `Select: ${step.label}`}
            style={{
              cursor: 'pointer',
              borderLeft: selectedStep === step.label ? '2px solid var(--accent)' : '2px solid transparent',
              paddingLeft: selectedStep === step.label ? 8 : 8,
              background: selectedStep === step.label ? 'var(--accent-soft)' : 'transparent',
              borderRadius: selectedStep === step.label ? 6 : 0,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <div className="funnel-label">{step.label}</div>
            <div className="funnel-bar" style={{ width: `${step.pct}%` }}>{step.pct}%</div>
            <div className="funnel-count">{step.count}</div>
            <div className="funnel-drop" style={{ color: step.dropColor }}>{step.drop}</div>
          </div>
        ))}
        <div className="funnel-note">
          <svg className="ico" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          Biggest drop-off is QR scan failure (20%) and backup adoption (54%). Both flagged for redesign sprint.
        </div>
      </div>

      {/* Feature Adoption + Auth Mix */}
      <div className="grid grid-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Feature adoption (% of MAU)</div>
          {featureAdoption.map(f => (
            <div
              key={f.label}
              className="adopt-row"
              onClick={() => setSelectedFeature(prev => prev === f.label ? null : f.label)}
              title={selectedFeature === f.label ? 'Deselect feature' : `Select: ${f.label}`}
              style={{
                cursor: 'pointer',
                borderLeft: selectedFeature === f.label ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: selectedFeature === f.label ? 8 : 8,
                background: selectedFeature === f.label ? 'var(--accent-soft)' : 'transparent',
                borderRadius: selectedFeature === f.label ? 6 : 0,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div className="adopt-head">
                <span>{f.label}</span>
                <span className="num">{f.pct}%</span>
              </div>
              <div className="adopt-track">
                <div className="adopt-fill" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">Auth method mix (last 7d)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={authMixData}
                  cx="50%" cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {authMixData.map((_, i) => (
                    <Cell key={i} fill={authColors[i % authColors.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0]
                    return (
                      <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6, padding: '8px 12px', fontSize: 11,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: p.payload.fill,
                      }}>
                        {p.name}: {p.value}%
                      </div>
                    )
                  }}
                />
                <Legend
                  iconSize={10}
                  iconType="circle"
                  formatter={value => (
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', color: c.text }}>
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
