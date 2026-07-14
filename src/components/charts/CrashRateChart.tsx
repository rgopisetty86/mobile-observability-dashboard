import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { crashByOSData } from '../../data/mockData'

// Color by crash rate severity
function barColor(rate: number): string {
  if (rate >= 2) return '#ef4444'   // red — severe
  if (rate >= 1) return '#f97316'   // orange — warning
  return '#10b981'                  // green — healthy
}

export default function CrashRateChart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Crash Rate by OS Version (%)
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={crashByOSData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, 'dataMax + 0.5']}
          />
          <YAxis
            type="category"
            dataKey="os"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              color: '#f9fafb',
            }}
            formatter={(value) => [`${value}%`, 'Crash Rate']}
          />
          <Bar dataKey="crashRate" radius={[0, 4, 4, 0]}>
            {crashByOSData.map((entry) => (
              <Cell key={entry.os} fill={barColor(entry.crashRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { color: '#10b981', label: '< 1% — Healthy' },
          { color: '#f97316', label: '1–2% — Warning' },
          { color: '#ef4444', label: '> 2% — Critical' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
