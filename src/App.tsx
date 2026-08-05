import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './lib/i18n'
import { useDarkMode } from './hooks/useDarkMode'
import { ThemeContext } from './context/ThemeContext'
import { DurationProvider } from './context/DurationContext'
import { useDatadogMetrics } from './hooks/useDatadogMetrics'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import SREDashboard from './pages/SREDashboard'
import EngineeringDashboard from './pages/EngineeringDashboard'
import ProductDashboard from './pages/ProductDashboard'
import SecurityDashboard from './pages/SecurityDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'

export type Section = 'sre' | 'engineering' | 'product' | 'security' | 'executive'

const titleKeys: Record<Section, string> = {
  sre:         'nav.sre',
  engineering: 'nav.engineering',
  product:     'nav.product',
  security:    'nav.security',
  executive:   'nav.executive',
}

const keyMap: Record<string, Section> = {
  '1': 'sre', '2': 'engineering', '3': 'product', '4': 'security', '5': 'executive',
}

export default function App() {
  const [section, setSection] = useState<Section>('sre')
  const { theme, isDark, setTheme, toggle } = useDarkMode()
  const { t } = useTranslation()
  useDatadogMetrics()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const s = keyMap[e.key]
      if (s) setSection(s)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggle }}>
      <DurationProvider>
        <div className="app">
          <Sidebar active={section} onSelect={setSection} />
          <main className="main">
            <Topbar title={t(titleKeys[section])} section={section} />
            <div className="demo-banner">
              <svg className="ico" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {t('demo.message')}
            </div>
            {section === 'sre'         && <SREDashboard         key="sre" />}
            {section === 'engineering' && <EngineeringDashboard key="engineering" />}
            {section === 'product'     && <ProductDashboard     key="product" />}
            {section === 'security'    && <SecurityDashboard    key="security" />}
            {section === 'executive'   && <ExecutiveDashboard   key="executive" onNavigate={setSection} />}
          </main>
        </div>
      </DurationProvider>
    </ThemeContext.Provider>
  )
}
