import type { Section } from '../../App'
import { useTheme } from '../../context/ThemeContext'

interface SidebarProps {
  active: Section
  onSelect: (s: Section) => void
}

const navItems: { id: Section; label: string; shortcut: string; icon: React.ReactNode }[] = [
  {
    id: 'sre', label: 'SRE', shortcut: '1',
    icon: (
      <svg className="ico nav-icon" viewBox="0 0 24 24">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    id: 'engineering', label: 'Engineering', shortcut: '2',
    icon: (
      <svg className="ico nav-icon" viewBox="0 0 24 24">
        <path d="M14.7 6.3a4 4 0 0 1 5 5L8 23l-5 1 1-5L14.7 6.3z" />
        <path d="m14 6 4 4" />
      </svg>
    ),
  },
  {
    id: 'product', label: 'Product', shortcut: '3',
    icon: (
      <svg className="ico nav-icon" viewBox="0 0 24 24">
        <path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    id: 'security', label: 'Security', shortcut: '4',
    icon: (
      <svg className="ico nav-icon" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'executive', label: 'Executive', shortcut: '5',
    icon: (
      <svg className="ico nav-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
]

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { isDark, toggle } = useTheme()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div className="brand-text">
          <span className="brand-name">Authenticator</span>
          <span className="brand-sub">Observability</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Dashboards</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            <span className="nav-shortcut">{item.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggle}>
          <svg className="ico" viewBox="0 0 24 24">
            {isDark
              ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>
              : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            }
          </svg>
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
          <span>v1.0 · sample data</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>keys 1–5</span>
        </div>
      </div>
    </aside>
  )
}
