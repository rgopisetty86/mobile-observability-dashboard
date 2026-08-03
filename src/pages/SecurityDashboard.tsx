import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../components/charts/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useSecurityData, resolveColor, severityBadge } from '../hooks/useSecurityData'

export default function SecurityDashboard() {
  const { t } = useTranslation()
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
        <div className="dash-title">{t('security.title')}</div>
        <div className="dash-subtitle">
          {t('security.subtitle')}
          {loading && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, marginLeft: 8 }}>{t('common.syncing')}</span>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          className="badge badge-danger"
          style={{ fontSize: 11, padding: '4px 10px', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          onClick={() => eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          title="Jump to security events table"
        >
          ● {t('security.activeInvestigations', { count: placeholder ?? kpis.activeInvestigations })}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-4">
        <div className="kpi">
          <div className="kpi-label">{t('security.kpi.mfaFatigue')}</div>
          <div className="kpi-value warning">{placeholder ?? kpis.mfaFatigue}</div>
          <div className="kpi-delta delta-down">↑ 142% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('security.kpi.geoImposs')}</div>
          <div className="kpi-value">{placeholder ?? kpis.geoImpossibilities}</div>
          <div className="kpi-delta delta-flat">flat vs baseline</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('security.kpi.integrity')}</div>
          <div className="kpi-value">{placeholder ?? kpis.integrityViolations}</div>
          <div className="kpi-delta delta-up">↓ 6% vs 7d avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('security.kpi.locked')}</div>
          <div className="kpi-value">{placeholder ?? kpis.accountsLocked}</div>
          <div className="kpi-delta delta-warn">↑ 38% (correlates w/ fatigue)</div>
        </div>
      </div>

      {/* Threat chart + Integrity breakdown */}
      <div className="grid grid-asym-2 row-gap">
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">{t('security.panel.threats')}</div>
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
                <Area dataKey="fatigue"   name={t('security.chart.mfaFatigue')} stroke={c.danger}  strokeWidth={1.5} fill="url(#fatigueGrad)"   dot={false} />
                <Area dataKey="integrity" name={t('security.chart.integrity')}  stroke={c.warning} strokeWidth={1.5} fill="url(#integrityGrad)" dot={false} />
                <Area dataKey="geo"       name={t('security.chart.geo')}         stroke={c.purple}  strokeWidth={1.5} fill="url(#geoGrad)"       dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">{t('security.panel.integrity')}</div>
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
          <span>{t('security.panel.events')}</span>
          <a className="panel-action" href="#">{t('common.openSiem')}</a>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 90 }}>
                {t('security.table.severity')}
                {activeSeverity && (
                  <button
                    onClick={() => setActiveSeverity(null)}
                    style={{
                      marginLeft: 6, fontSize: 10, cursor: 'pointer',
                      color: 'var(--text-secondary)', background: 'none',
                      border: 'none', padding: 0, fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                    title={t('common.clearFilter')}
                  >
                    {t('common.clear')}
                  </button>
                )}
              </th>
              <th>{t('security.table.pattern')}</th>
              <th style={{ width: 120 }}>{t('security.table.geo')}</th>
              <th style={{ width: 80 }}>{t('security.table.affected')}</th>
              <th style={{ width: 80, textAlign: 'right' }}>{t('security.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.map((e, i) => (
              <tr key={i}>
                <td>
                  <button
                    className={`badge ${severityBadge(e.severity)}`}
                    onClick={() => toggleSeverity(severityBadge(e.severity))}
                    title={activeSeverity === severityBadge(e.severity) ? t('common.clearFilter') : t('common.filterBy', { label: e.severity })}
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
