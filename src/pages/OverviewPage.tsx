import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import SkeletonCard, { SkeletonChart } from '../components/SkeletonCard'
import SessionsChart from '../components/charts/SessionsChart'
import CrashRateChart from '../components/charts/CrashRateChart'
import { metrics } from '../data/mockData'

export default function OverviewPage() {
  // Simulate a brief loading delay so the skeleton states are visible
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          High-level summary of your mobile app's health.
        </p>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <SessionsChart />
            <CrashRateChart />
          </>
        )}
      </div>
    </div>
  )
}
