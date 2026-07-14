import type { ReactElement } from 'react'
import type { Metric } from '../types'

// Icon map — each icon is an inline SVG keyed by the Metric.icon string
const icons: Record<Metric['icon'], ReactElement> = {
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 00-3-3.87" />
    </svg>
  ),
  crash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  ),
  sessions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h6M3 21v-2a4 4 0 014-4h.01M3 7a4 4 0 118 0 4 4 0 01-8 0z" />
    </svg>
  ),
  memory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  fps: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}

interface MetricCardProps {
  metric: Metric
}

export default function MetricCard({ metric }: MetricCardProps) {
  const isPositiveDelta = metric.delta > 0
  // For crash rate, a higher number is bad; for others it's good.
  // We use a simple heuristic: if the metric id contains "crash" or "load" or "memory",
  // positive delta is bad (red), negative is good (green). Otherwise reverse.
  const isInvertedMetric = ['crash-rate', 'avg-load-time', 'memory-usage'].includes(metric.id)
  const isGoodChange = isInvertedMetric ? !isPositiveDelta : isPositiveDelta

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</span>
        <span className="text-gray-400 dark:text-gray-500">{icons[metric.icon]}</span>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {metric.value}
      </p>

      {/* Delta badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isGoodChange
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isPositiveDelta ? '▲' : '▼'} {Math.abs(metric.delta)}%
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{metric.deltaLabel}</span>
      </div>
    </div>
  )
}
