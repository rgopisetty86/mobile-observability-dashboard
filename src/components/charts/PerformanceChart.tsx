import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { performanceData } from '../../data/mockData'

interface ChartConfig {
  title: string
  dataKey: keyof typeof performanceData[0]
  color: string
  unit: string
  formatter: (v: number) => string
}

const charts: ChartConfig[] = [
  {
    title: 'App Start Time',
    dataKey: 'startTimeSecs',
    color: '#6366f1',
    unit: 's',
    formatter: (v) => `${v.toFixed(2)}s`,
  },
  {
    title: 'Frame Rate',
    dataKey: 'frameRate',
    color: '#10b981',
    unit: 'fps',
    formatter: (v) => `${v} fps`,
  },
  {
    title: 'Memory Usage',
    dataKey: 'memoryMB',
    color: '#f97316',
    unit: 'MB',
    formatter: (v) => `${v} MB`,
  },
]

export default function PerformanceChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {charts.map((chart) => (
        <div
          key={chart.title}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{chart.title}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={performanceData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${chart.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chart.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}${chart.unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#f9fafb',
                }}
                formatter={(value) => [chart.formatter(Number(value)), chart.title]}
              />
              <Area
                type="monotone"
                dataKey={chart.dataKey as string}
                stroke={chart.color}
                strokeWidth={2}
                fill={`url(#grad-${chart.dataKey})`}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
