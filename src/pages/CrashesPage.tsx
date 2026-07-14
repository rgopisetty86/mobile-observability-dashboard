import { crashes } from '../data/mockData'
import type { Crash, Severity, Platform } from '../types'

const severityBadge: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  high:     'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400',
  medium:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
  low:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const platformBadge: Record<Platform, string> = {
  iOS:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Android: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}>
      {text}
    </span>
  )
}

export default function CrashesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Crashes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and triage crash reports from your mobile app.
        </p>
      </div>

      <div className="space-y-3">
        {crashes.map((crash: Crash) => (
          <div
            key={crash.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge text={crash.severity} className={severityBadge[crash.severity]} />
                  <Badge text={crash.platform} className={platformBadge[crash.platform]} />
                  <span className="text-xs text-gray-400 dark:text-gray-500">{crash.osVersion} · v{crash.appVersion}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{crash.title}</h3>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-5 shrink-0 text-right">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Occurrences</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{crash.occurrences.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Affected Users</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{crash.affectedUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Stack trace preview */}
            <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400 truncate">
              {crash.message}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span>First seen {timeAgo(crash.firstSeen)}</span>
              <span>·</span>
              <span>Last seen {timeAgo(crash.lastSeen)}</span>
              <span>·</span>
              <span className="font-mono">{crash.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
