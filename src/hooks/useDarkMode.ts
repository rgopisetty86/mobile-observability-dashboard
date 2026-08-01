import { useState, useEffect } from 'react'
import { type ThemeName, THEMES } from '../context/ThemeContext'

const STORAGE_KEY = 'obs-theme'
const DARK_THEMES = new Set<ThemeName>(THEMES.filter(t => t.dark).map(t => t.name))

function readSaved(): ThemeName {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && THEMES.some(t => t.name === v)) return v as ThemeName
  } catch {}
  return 'dark'
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<ThemeName>(readSaved)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  const setTheme = (t: ThemeName) => setThemeState(t)
  const isDark = DARK_THEMES.has(theme)
  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return { theme, isDark, setTheme, toggle }
}
