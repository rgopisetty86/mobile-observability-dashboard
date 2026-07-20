import { useState, useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { ThemeContext } from './context/ThemeContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import SREDashboard from './pages/SREDashboard'
import EngineeringDashboard from './pages/EngineeringDashboard'
import ProductDashboard from './pages/ProductDashboard'
import SecurityDashboard from './pages/SecurityDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'

export type Section = 'sre' | 'engineering' | 'product' | 'security' | 'executive'

const titles: Record<Section, string> = {
  sre:         'SRE',
  engineering: 'Engineering',
  product:     'Product',
  security:    'Security',
  executive:   'Executive',
}

const ranges: Record<Section, string> = {
  sre:         'last 1h',
  engineering: 'last 24h',
  product:     'last 30d vs prior',
  security:    'last 24h',
  executive:   'May vs April',
}

const keyMap: Record<string, Section> = {
  '1': 'sre', '2': 'engineering', '3': 'product', '4': 'security', '5': 'executive',
}

export default function App() {
  const [section, setSection] = useState<Section>('sre')
  const { isDark, toggle } = useDarkMode()

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
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <div className="app">
        <Sidebar active={section} onSelect={setSection} />
        <main className="main">
          <Topbar title={titles[section]} range={ranges[section]} />
          <div className="demo-banner">
            <svg className="ico" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            Sample data — numbers are illustrative. Replace queries and panel sources with your own
            Prometheus / Datadog / Amplitude instance to drive these live.
          </div>
          {section === 'sre'         && <SREDashboard         key="sre" />}
          {section === 'engineering' && <EngineeringDashboard key="engineering" />}
          {section === 'product'     && <ProductDashboard     key="product" />}
          {section === 'security'    && <SecurityDashboard    key="security" />}
          {section === 'executive'   && <ExecutiveDashboard   key="executive" onNavigate={setSection} />}
        </main>
      </div>
    </ThemeContext.Provider>
  )
}
