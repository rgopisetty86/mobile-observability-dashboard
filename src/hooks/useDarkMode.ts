import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return (localStorage.getItem('obs-theme') ?? 'dark') !== 'light' } catch { return true }
  })

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('obs-theme', theme) } catch {}
  }, [isDark])

  return { isDark, toggle: () => setIsDark(v => !v) }
}
