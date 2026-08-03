import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useExecutiveData, resolveScorecardColor } from '../hooks/useExecutiveData'
import type { Section } from '../App'

export default function ExecutiveDashboard({ onNavigate }: { onNavigate?: (section: Section) => void }) {
  const { t } = useTranslation()
  const c = useChartColors()
  const { loading, kpis, mauGrowth, reliability, security, platformMix, regions, unitEcon } = useExecutiveData()
  const tickStyle = { fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: c.text }
  const placeholder = loading ? '—' : null

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div className="dash-title">{t('exec.title')}</div>
        <div className="dash-subtitle">
          {t('exec.subtitle')}
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>{t('common.syncing')}</span>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-5">
        <div className="kpi">
          <div className="kpi-label">{t('exec.kpi.mau')}</div>
          <div className="kpi-value">{placeholder ?? kpis.mau}</div>
          <div className="kpi-delta delta-up">↑ 8.4%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('exec.kpi.installs')}</div>
          <div className="kpi-value">{placeholder ?? kpis.installs}</div>
          <div className="kpi-delta delta-up">↑ 14%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('exec.kpi.d30')}</div>
          <div className="kpi-value">{placeholder ?? kpis.d30Retention}</div>
          <div className="kpi-delta delta-up">↑ 3pp</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('exec.kpi.nps')}</div>
          <div className="kpi-value">{placeholder ?? kpis.nps}</div>
          <div className="kpi-delta delta-up">↑ 4 pts</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('exec.kpi.rating')}</div>
          <div className="kpi-value">{placeholder ?? kpis.rating}</div>
          <div className="kpi-delta delta-flat">{t('common.stable')}</div>
        </div>
      </div>

      {/* Reliability + Security scorecards */}
      <div className="grid grid-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">
            {t('exec.panel.reliability')}
            {onNavigate && (
              <button
                className="panel-action"
                onClick={() => onNavigate('sre')}
                style={{ cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit' }}
              >
                {t('exec.viewSre')}
              </button>
            )}
          </div>
          {reliability.map((r, i) => (
            <div
              key={i}
              className="score-row"
              onClick={() => onNavigate?.('sre')}
              style={{ cursor: onNavigate ? 'pointer' : 'default' }}
            >
              <span className="score-label">{r.label}</span>
              <span className="score-value" style={resolveScorecardColor(r.colorToken) ? { color: resolveScorecardColor(r.colorToken) } : {}}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">
            {t('exec.panel.security')}
            {onNavigate && (
              <button
                className="panel-action"
                onClick={() => onNavigate('security')}
                style={{ cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit' }}
              >
                {t('exec.viewSecurity')}
              </button>
            )}
          </div>
          {security.map((s, i) => (
            <div
              key={i}
              className="score-row"
              onClick={() => onNavigate?.('security')}
              style={{ cursor: onNavigate ? 'pointer' : 'default' }}
            >
              <span className="score-label">{s.label}</span>
              <span className="score-value" style={resolveScorecardColor(s.colorToken) ? { color: resolveScorecardColor(s.colorToken) } : {}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAU Growth Chart */}
      <div className="panel">
        <div className="panel-title">{t('exec.panel.mauGrowth')}</div>
        <div className="chart-wrap short">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mauGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid stroke={c.grid} vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: c.grid }} tickLine={false} />
              <YAxis
                tick={tickStyle} axisLine={false} tickLine={false}
                tickFormatter={v => Number(v).toFixed(1) + 'M'}
              />
              <Tooltip content={<ChartTooltip formatter={v => Number(v).toFixed(1) + 'M'} />} />
              <Bar dataKey="mau" fill={c.accent} radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform mix + Regions + Unit economics */}
      <div className="grid grid-3 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">{t('exec.panel.platformMix')}</div>
          {platformMix.map(p => (
            <div key={p.label} className="adopt-row">
              <div className="adopt-head">
                <span>{p.label}</span>
                <span className="num">{p.pct}%</span>
              </div>
              <div className="adopt-track">
                <div className="adopt-fill" style={{ width: `${p.pct}%`, background: resolveScorecardColor(p.colorToken) }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">{t('exec.panel.regions')}</div>
          {regions.map((r, i) => (
            <div key={i} className="score-row" style={{ padding: '5px 0' }}>
              <span>{r.label}</span>
              <span className="score-value">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">{t('exec.panel.unitEcon')}</div>
          {unitEcon.map((u, i) => (
            <div key={i} className="score-row" style={{ padding: '5px 0' }}>
              <span className="score-label">{u.label}</span>
              <span className="score-value" style={resolveScorecardColor(u.colorToken) ? { color: resolveScorecardColor(u.colorToken) } : {}}>{u.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
