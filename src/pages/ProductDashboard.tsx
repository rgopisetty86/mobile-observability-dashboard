import { useState } from 'react'
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useProductData, resolveDropColor } from '../hooks/useProductData'

export default function ProductDashboard() {
  const c = useChartColors()
  const { loading, kpis, mauTrend, funnelSteps, featureAdoption, authMix } = useProductData()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const authColors = [c.accent, c.success, c.purple]
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const placeholder = loading ? '—' : null

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">North star &amp; enrollment</div>
        <div className="dash-subtitle">
          Product leadership review · last 30 days vs prior 30
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>syncing…</span>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Monthly active users</div>
          <div className="kpi-value">{placeholder ?? kpis.mau}</div>
          <div className="kpi-delta delta-up">↑ 8.4% MoM</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Daily active users</div>
          <div className="kpi-value">{placeholder ?? kpis.dau}</div>
          <div className="kpi-delta delta-up">↑ 6.1% MoM</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">DAU / MAU stickiness</div>
          <div className="kpi-value">{placeholder ?? kpis.stickiness}</div>
          <div className="kpi-delta delta-flat">flat (target 40%+)</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">D30 retention</div>
          <div className="kpi-value">{placeholder ?? kpis.d30Retention}</div>
          <div className="kpi-delta delta-up">↑ 3pp MoM</div>
        </div>
      </div>

      {/* MAU Trend */}
      <div className="panel">
        <div className="panel-title">MAU trend (90 days)</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mauTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
              <Tooltip content={<ChartTooltip formatter={v => Number(v).toFixed(2) + 'M'} />} />
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
              paddingLeft: 8,
              background: selectedStep === step.label ? 'var(--accent-soft)' : 'transparent',
              borderRadius: selectedStep === step.label ? 6 : 0,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <div className="funnel-label">{step.label}</div>
            <div className="funnel-bar" style={{ width: `${step.pct}%` }}>{step.pct}%</div>
            <div className="funnel-count">{step.count}</div>
            <div className="funnel-drop" style={{ color: resolveDropColor(step.dropColorToken) }}>{step.drop}</div>
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
                paddingLeft: 8,
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
                  data={authMix}
                  cx="50%" cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {authMix.map((_, i) => (
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
