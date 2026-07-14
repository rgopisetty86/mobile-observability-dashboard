export interface Metric {
  id: string
  label: string
  value: string
  delta: number       // percentage change vs previous period, e.g. 4.2 means +4.2%
  deltaLabel: string  // human-readable, e.g. "vs last week"
  icon: 'users' | 'crash' | 'clock' | 'sessions' | 'memory' | 'fps'
}

export type SessionStatus = 'completed' | 'crashed' | 'timeout'
export type Platform = 'iOS' | 'Android'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface Session {
  id: string
  userId: string
  device: string
  platform: Platform
  osVersion: string
  appVersion: string
  durationSecs: number
  status: SessionStatus
  startedAt: string   // ISO date string
}

export interface Crash {
  id: string
  title: string
  message: string
  platform: Platform
  osVersion: string
  appVersion: string
  severity: Severity
  occurrences: number
  affectedUsers: number
  firstSeen: string
  lastSeen: string
}

export interface DailySessionPoint {
  date: string        // e.g. "Jul 1"
  sessions: number
  crashes: number
}

export interface CrashByOS {
  os: string          // e.g. "iOS 17", "Android 14"
  crashRate: number   // percentage 0-100
}

export interface PerformancePoint {
  date: string
  startTimeSecs: number
  frameRate: number   // fps
  memoryMB: number
}
