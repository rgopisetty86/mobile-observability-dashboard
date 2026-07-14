import PerformanceChart from '../components/charts/PerformanceChart'
import { performanceData } from '../data/mockData'

// Derived summary stats from the last data point
const latest = performanceData[performanceData.length - 1]

const summaryStats = [
  { label: 'App Start Time', value: `${latest.startTimeSecs.toFixed(2)}s`, target: '< 2.0s', ok: latest.startTimeSecs < 2.0 },
  { label: 'Frame Rate',     value: `${latest.frameRate} fps`,             target: '≥ 60 fps', ok: latest.frameRate >= 60 },
  { label: 'Memory Usage',   value: `${latest.memoryMB} MB`,               target: '< 200 MB', ok: latest.memoryMB < 200 },
]

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor app start time, frame rate, and memory usage over the last 14 days.
        </p>
      </div>

      {/* Summary stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-1 shadow-sm"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{stat.value}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${stat.ok ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Target: {stat.target}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance trend charts */}
      <PerformanceChart />
    </div>
  )
}
