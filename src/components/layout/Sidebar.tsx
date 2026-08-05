import { useTranslation } from 'react-i18next'
import type { Section } from '../../App'

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
  const { t } = useTranslation()

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
        <div className="nav-label">{t('nav.dashboards')}</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.icon}
            <span>{t(`nav.${item.id}`)}</span>
            <span className="nav-shortcut">{item.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
          <span>{t('sidebar.version')}</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>{t('sidebar.keys')}</span>
        </div>
      </div>
    </aside>
  )
}
