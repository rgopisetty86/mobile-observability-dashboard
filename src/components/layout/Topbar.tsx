import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, setLanguage, type LangCode } from '../../lib/i18n'

interface TopbarProps {
  title: string
  range: string
}

export default function Topbar({ title, range }: TopbarProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (code: LangCode) => {
    setLanguage(code)
    setOpen(false)
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
      </div>
      <div className="topbar-right">
        <span className="range-pill">{range}</span>

        {/* Language selector */}
        <div className="lang-selector" ref={ref}>
          <button
            className="lang-btn"
            onClick={() => setOpen(o => !o)}
            aria-label="Select language"
            aria-expanded={open}
          >
            <span className="lang-flag">{currentLang.flag}</span>
            <span className="lang-code">{currentLang.code.toUpperCase()}</span>
            <svg
              className="lang-chevron"
              viewBox="0 0 24 24"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div className="lang-dropdown">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option${lang.code === i18n.language ? ' active' : ''}`}
                  onClick={() => handleSelect(lang.code)}
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
