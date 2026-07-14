import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { dailySessionData } from '../../data/mockData'

export default function SessionsChart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Daily Sessions &amp; Crashes
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={dailySessionData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            yAxisId="sessions"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="crashes"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              color: '#f9fafb',
            }}
            formatter={(value, name) => [
              name === 'sessions' ? `${Number(value).toLocaleString()}` : value,
              name === 'sessions' ? 'Sessions' : 'Crashes',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => (value === 'sessions' ? 'Sessions' : 'Crashes')}
          />
          <Line
            yAxisId="sessions"
            type="monotone"
            dataKey="sessions"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="crashes"
            type="monotone"
            dataKey="crashes"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
