import { useTheme } from '../context/ThemeContext'

export function useChartColors() {
  const { isDark } = useTheme()
  return {
    accent:    isDark ? '#4f9eff' : '#2563eb',
    success:   isDark ? '#34d399' : '#059669',
    warning:   isDark ? '#fb923c' : '#d97706',
    danger:    isDark ? '#f87171' : '#dc2626',
    purple:    isDark ? '#c084fc' : '#7c3aed',
    teal:      isDark ? '#2dd4bf' : '#0d9488',
    muted:     isDark ? '#4d5e7a' : '#9ca3af',
    grid:      isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    text:      isDark ? '#4d5e7a' : '#6b7280',
    elevated:  isDark ? 'rgba(255,255,255,0.08)' : '#e8edf8',
    surface:   isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border:    isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
    primary:   isDark ? '#eef2ff' : '#111827',
    secondary: isDark ? '#8899b8' : '#4b5563',
    accentBg:  isDark ? 'rgba(79,158,255,0.10)'  : 'rgba(37,99,235,0.07)',
    dangerBg:  isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.07)',
    warnBg:    isDark ? 'rgba(251,146,60,0.10)'  : 'rgba(217,119,6,0.07)',
    purpleBg:  isDark ? 'rgba(192,132,252,0.12)' : 'rgba(124,58,237,0.08)',
  }
}
