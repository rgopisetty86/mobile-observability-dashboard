import type {
  Metric,
  Session,
  Crash,
  DailySessionPoint,
  CrashByOS,
  PerformancePoint,
} from '../types'

// ─── Overview Metrics ──────────────────────────────────────────────────────

export const metrics: Metric[] = [
  {
    id: 'active-users',
    label: 'Active Users',
    value: '48,291',
    delta: 6.2,
    deltaLabel: 'vs last week',
    icon: 'users',
  },
  {
    id: 'crash-rate',
    label: 'Crash Rate',
    value: '0.84%',
    delta: -1.3,
    deltaLabel: 'vs last week',
    icon: 'crash',
  },
  {
    id: 'avg-load-time',
    label: 'Avg Load Time',
    value: '1.42 s',
    delta: -5.7,
    deltaLabel: 'vs last week',
    icon: 'clock',
  },
  {
    id: 'total-sessions',
    label: 'Total Sessions',
    value: '312,048',
    delta: 11.4,
    deltaLabel: 'vs last week',
    icon: 'sessions',
  },
  {
    id: 'memory-usage',
    label: 'Avg Memory',
    value: '184 MB',
    delta: 2.1,
    deltaLabel: 'vs last week',
    icon: 'memory',
  },
  {
    id: 'frame-rate',
    label: 'Frame Rate',
    value: '58.3 fps',
    delta: -0.8,
    deltaLabel: 'vs last week',
    icon: 'fps',
  },
]

// ─── Daily Sessions Chart ──────────────────────────────────────────────────

export const dailySessionData: DailySessionPoint[] = [
  { date: 'Jul 1',  sessions: 40200, crashes: 342 },
  { date: 'Jul 2',  sessions: 42100, crashes: 318 },
  { date: 'Jul 3',  sessions: 38900, crashes: 290 },
  { date: 'Jul 4',  sessions: 35600, crashes: 410 },
  { date: 'Jul 5',  sessions: 41800, crashes: 375 },
  { date: 'Jul 6',  sessions: 44500, crashes: 280 },
  { date: 'Jul 7',  sessions: 46200, crashes: 260 },
  { date: 'Jul 8',  sessions: 43100, crashes: 300 },
  { date: 'Jul 9',  sessions: 47800, crashes: 220 },
  { date: 'Jul 10', sessions: 51200, crashes: 195 },
  { date: 'Jul 11', sessions: 49300, crashes: 210 },
  { date: 'Jul 12', sessions: 52100, crashes: 188 },
  { date: 'Jul 13', sessions: 50800, crashes: 202 },
  { date: 'Jul 14', sessions: 48291, crashes: 215 },
]

// ─── Crash Rate by OS ──────────────────────────────────────────────────────

export const crashByOSData: CrashByOS[] = [
  { os: 'iOS 17',      crashRate: 0.61 },
  { os: 'iOS 16',      crashRate: 1.02 },
  { os: 'iOS 15',      crashRate: 2.14 },
  { os: 'Android 14',  crashRate: 0.74 },
  { os: 'Android 13',  crashRate: 1.38 },
  { os: 'Android 12',  crashRate: 1.91 },
  { os: 'Android 11',  crashRate: 3.05 },
]

// ─── Sessions Table ────────────────────────────────────────────────────────

export const sessions: Session[] = [
  { id: 's-001', userId: 'u-7821', device: 'iPhone 15 Pro',    platform: 'iOS',     osVersion: 'iOS 17.4',      appVersion: '3.2.1', durationSecs: 342,  status: 'completed', startedAt: '2026-07-14T08:12:00Z' },
  { id: 's-002', userId: 'u-3142', device: 'Samsung Galaxy S24', platform: 'Android', osVersion: 'Android 14', appVersion: '3.2.1', durationSecs: 87,   status: 'crashed',   startedAt: '2026-07-14T08:15:00Z' },
  { id: 's-003', userId: 'u-5508', device: 'Pixel 8',           platform: 'Android', osVersion: 'Android 14', appVersion: '3.1.9', durationSecs: 1204, status: 'completed', startedAt: '2026-07-14T08:18:00Z' },
  { id: 's-004', userId: 'u-9901', device: 'iPhone 14',         platform: 'iOS',     osVersion: 'iOS 16.7',      appVersion: '3.1.9', durationSecs: 211,  status: 'completed', startedAt: '2026-07-14T08:20:00Z' },
  { id: 's-005', userId: 'u-2277', device: 'OnePlus 12',        platform: 'Android', osVersion: 'Android 13', appVersion: '3.2.0', durationSecs: 30,   status: 'timeout',   startedAt: '2026-07-14T08:22:00Z' },
  { id: 's-006', userId: 'u-6634', device: 'iPhone 13 mini',    platform: 'iOS',     osVersion: 'iOS 16.3',      appVersion: '3.1.8', durationSecs: 678,  status: 'completed', startedAt: '2026-07-14T08:25:00Z' },
  { id: 's-007', userId: 'u-4412', device: 'Pixel 7a',          platform: 'Android', osVersion: 'Android 13', appVersion: '3.2.1', durationSecs: 445,  status: 'completed', startedAt: '2026-07-14T08:28:00Z' },
  { id: 's-008', userId: 'u-8821', device: 'Samsung Galaxy A55', platform: 'Android', osVersion: 'Android 12', appVersion: '3.0.5', durationSecs: 55,   status: 'crashed',   startedAt: '2026-07-14T08:30:00Z' },
  { id: 's-009', userId: 'u-1192', device: 'iPhone 15',         platform: 'iOS',     osVersion: 'iOS 17.2',      appVersion: '3.2.1', durationSecs: 892,  status: 'completed', startedAt: '2026-07-14T08:33:00Z' },
  { id: 's-010', userId: 'u-3389', device: 'Xiaomi 14',         platform: 'Android', osVersion: 'Android 14', appVersion: '3.2.0', durationSecs: 127,  status: 'completed', startedAt: '2026-07-14T08:36:00Z' },
]

// ─── Crashes Table ─────────────────────────────────────────────────────────

export const crashes: Crash[] = [
  {
    id: 'c-001',
    title: 'NullPointerException in CartViewModel',
    message: 'java.lang.NullPointerException: Attempt to invoke virtual method on a null object reference',
    platform: 'Android',
    osVersion: 'Android 11',
    appVersion: '3.2.1',
    severity: 'critical',
    occurrences: 1482,
    affectedUsers: 934,
    firstSeen: '2026-07-08T11:00:00Z',
    lastSeen:  '2026-07-14T07:55:00Z',
  },
  {
    id: 'c-002',
    title: 'EXC_BAD_ACCESS in ImageLoader',
    message: 'Thread 1: EXC_BAD_ACCESS (SIGSEGV) — accessing deallocated memory in SDWebImage handler',
    platform: 'iOS',
    osVersion: 'iOS 15.8',
    appVersion: '3.1.9',
    severity: 'high',
    occurrences: 671,
    affectedUsers: 421,
    firstSeen: '2026-07-05T14:20:00Z',
    lastSeen:  '2026-07-14T06:10:00Z',
  },
  {
    id: 'c-003',
    title: 'ANR: Input dispatching timed out',
    message: 'Application Not Responding — main thread blocked for >5s waiting on network I/O',
    platform: 'Android',
    osVersion: 'Android 12',
    appVersion: '3.2.0',
    severity: 'high',
    occurrences: 509,
    affectedUsers: 378,
    firstSeen: '2026-07-10T09:30:00Z',
    lastSeen:  '2026-07-14T05:45:00Z',
  },
  {
    id: 'c-004',
    title: 'Fatal: Unhandled Promise Rejection',
    message: 'Unhandled Promise Rejection: NetworkError: Failed to fetch — TypeError: Network request failed',
    platform: 'iOS',
    osVersion: 'iOS 16.7',
    appVersion: '3.2.1',
    severity: 'medium',
    occurrences: 288,
    affectedUsers: 192,
    firstSeen: '2026-07-11T16:00:00Z',
    lastSeen:  '2026-07-14T04:20:00Z',
  },
  {
    id: 'c-005',
    title: 'StackOverflowError in RecursiveParser',
    message: 'java.lang.StackOverflowError: stack size 8MB — caused by deep recursive JSON parsing',
    platform: 'Android',
    osVersion: 'Android 13',
    appVersion: '3.1.8',
    severity: 'medium',
    occurrences: 134,
    affectedUsers: 98,
    firstSeen: '2026-07-12T10:15:00Z',
    lastSeen:  '2026-07-13T22:00:00Z',
  },
  {
    id: 'c-006',
    title: 'Crash in WKWebView (JS bridge)',
    message: 'Fatal exception: -[WKWebView loadRequest:] called after dealloc',
    platform: 'iOS',
    osVersion: 'iOS 17.4',
    appVersion: '3.2.1',
    severity: 'low',
    occurrences: 47,
    affectedUsers: 35,
    firstSeen: '2026-07-13T08:00:00Z',
    lastSeen:  '2026-07-13T18:30:00Z',
  },
]

// ─── Performance Chart ─────────────────────────────────────────────────────

export const performanceData: PerformancePoint[] = [
  { date: 'Jul 1',  startTimeSecs: 2.1, frameRate: 57, memoryMB: 178 },
  { date: 'Jul 2',  startTimeSecs: 2.0, frameRate: 58, memoryMB: 181 },
  { date: 'Jul 3',  startTimeSecs: 2.3, frameRate: 55, memoryMB: 185 },
  { date: 'Jul 4',  startTimeSecs: 2.4, frameRate: 54, memoryMB: 188 },
  { date: 'Jul 5',  startTimeSecs: 2.2, frameRate: 56, memoryMB: 182 },
  { date: 'Jul 6',  startTimeSecs: 1.9, frameRate: 59, memoryMB: 179 },
  { date: 'Jul 7',  startTimeSecs: 1.8, frameRate: 59, memoryMB: 176 },
  { date: 'Jul 8',  startTimeSecs: 1.7, frameRate: 60, memoryMB: 174 },
  { date: 'Jul 9',  startTimeSecs: 1.6, frameRate: 60, memoryMB: 180 },
  { date: 'Jul 10', startTimeSecs: 1.5, frameRate: 60, memoryMB: 183 },
  { date: 'Jul 11', startTimeSecs: 1.5, frameRate: 59, memoryMB: 186 },
  { date: 'Jul 12', startTimeSecs: 1.4, frameRate: 58, memoryMB: 184 },
  { date: 'Jul 13', startTimeSecs: 1.4, frameRate: 58, memoryMB: 185 },
  { date: 'Jul 14', startTimeSecs: 1.42, frameRate: 58, memoryMB: 184 },
]
