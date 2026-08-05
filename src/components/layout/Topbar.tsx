import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, setLanguage, type LangCode } from '../../lib/i18n'
import { useDuration, SECTION_DURATIONS } from '../../context/DurationContext'
import { useTheme, THEMES } from '../../context/ThemeContext'
import type { Section } from '../../App'

interface TopbarProps {
  title: string
  section: Section
}

export default function Topbar({ title, section }: TopbarProps) {
  const { t, i18n } = useTranslation()
  const { duration, setDuration } = useDuration()
  const { theme, setTheme } = useTheme()
  const [langOpen, setLangOpen]   = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const langRef  = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]
  const currentTheme = THEMES.find(th => th.name === theme) ?? THEMES[0]
  const durations = SECTION_DURATIONS[section]
  const activeDur = duration[section]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current  && !langRef.current.contains(e.target as Node))  setLangOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLangSelect = (code: LangCode) => {
    setLanguage(code)
    setLangOpen(false)
  }

  const handleThemeSelect = (name: typeof theme) => {
    setTheme(name)
    setThemeOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="crumb">
          <span>{t('topbar.observability')}</span>
          <svg className="ico" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="crumb-current">{title}</span>
        </div>

        {/* Duration picker */}
        <div className="dur-picker" role="group" aria-label="Select time range">
          {durations.map(opt => (
            <button
              key={opt.value}
              className={`dur-pill${activeDur === opt.value ? ' active' : ''}`}
              onClick={() => setDuration(section, opt.value)}
              aria-pressed={activeDur === opt.value}
            >
              {opt.value}
            </button>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        {/* Active duration label */}
        <span className="range-pill">
          {durations.find(o => o.value === activeDur)?.label ?? activeDur}
        </span>

        {/* Theme selector */}
        <div className="lang-selector" ref={themeRef}>
          <button
            className="lang-btn"
            onClick={() => setThemeOpen(o => !o)}
            aria-label="Select theme"
            aria-expanded={themeOpen}
            title="Select theme"
          >
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              background: currentTheme.swatch,
              display: 'inline-block', flexShrink: 0,
              boxShadow: `0 0 6px ${currentTheme.swatch}88`,
            }} />
            <span className="lang-code" style={{ minWidth: 36 }}>{currentTheme.label}</span>
            <svg
              className="lang-chevron"
              viewBox="0 0 24 24"
              style={{ transform: themeOpen ? 'rotate(180deg)' : 'none' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {themeOpen && (
            <div className="lang-dropdown" style={{ minWidth: 140 }}>
              {THEMES.map(th => (
                <button
                  key={th.name}
                  className={`lang-option${th.name === theme ? ' active' : ''}`}
                  onClick={() => handleThemeSelect(th.name)}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: th.swatch, flexShrink: 0,
                    display: 'inline-block',
                    boxShadow: th.name === theme ? `0 0 6px ${th.swatch}88` : 'none',
                  }} />
                  <span className="lang-option-label">{th.label}</span>
                  {th.name === theme && (
                    <svg className="lang-check" viewBox="0 0 24 24">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language selector */}
        <div className="lang-selector" ref={langRef}>
          <button
            className="lang-btn"
            onClick={() => setLangOpen(o => !o)}
            aria-label="Select language"
            aria-expanded={langOpen}
          >
            <span className="lang-flag">{currentLang.flag}</span>
            <span className="lang-code">{currentLang.code.toUpperCase()}</span>
            <svg
              className="lang-chevron"
              viewBox="0 0 24 24"
              style={{ transform: langOpen ? 'rotate(180deg)' : 'none' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {langOpen && (
            <div className="lang-dropdown">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option${lang.code === i18n.language ? ' active' : ''}`}
                  onClick={() => handleLangSelect(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-option-label">{lang.label}</span>
                  {lang.code === i18n.language && (
                    <svg className="lang-check" viewBox="0 0 24 24">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="live-pill">
          <span className="live-dot" />
          {t('topbar.live')}
        </span>
      </div>
    </header>
  )
}
