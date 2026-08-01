import { createContext, useContext } from 'react'

export type ThemeName = 'dark' | 'light' | 'midnight' | 'forest' | 'dusk'

export const THEMES: { name: ThemeName; label: string; swatch: string; dark: boolean }[] = [
  { name: 'dark',     label: 'Dark',     swatch: '#4f9eff', dark: true  },
  { name: 'light',    label: 'Light',    swatch: '#2563eb', dark: false },
  { name: 'midnight', label: 'Midnight', swatch: '#a78bfa', dark: true  },
  { name: 'forest',   label: 'Forest',   swatch: '#4ade80', dark: true  },
  { name: 'dusk',     label: 'Dusk',     swatch: '#fb7185', dark: true  },
]

interface ThemeCtx {
  theme: ThemeName
  isDark: boolean
  setTheme: (t: ThemeName) => void
  toggle: () => void
}

export const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)
