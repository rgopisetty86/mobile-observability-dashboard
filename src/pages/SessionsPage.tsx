import { sessions } from '../data/mockData'
import type { Session, SessionStatus, Platform } from '../types'

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusBadge: Record<SessionStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  crashed:   'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  timeout:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const platformBadge: Record<Platform, string> = {
  iOS:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Android: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}>
      {text}
    </span>
  )
}

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sessions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse and analyze individual user sessions.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Session ID', 'User', 'Device', 'Platform', 'OS', 'App Ver', 'Duration', 'Status', 'Started'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sessions.map((session: Session) => (
                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{session.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{session.userId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{session.device}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge text={session.platform} className={platformBadge[session.platform]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{session.osVersion}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{session.appVersion}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDuration(session.durationSecs)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge text={session.status} className={statusBadge[session.status]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTime(session.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          Showing {sessions.length} sessions · Jul 14, 2026
        </div>
      </div>
    </div>
  )
}
