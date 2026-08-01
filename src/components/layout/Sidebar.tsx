import type { Section } from '../../App'
import { useTheme, THEMES } from '../../context/ThemeContext'

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
  const { theme, setTheme } = useTheme()

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
        {/* Theme picker */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 9.5,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            marginBottom: 8,
          }}>
            Theme
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {THEMES.map(t => (
              <button
                key={t.name}
                title={t.label}
                onClick={() => setTheme(t.name)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: theme === t.name
                    ? `2px solid ${t.swatch}`
                    : '2px solid var(--border-subtle)',
                  background: theme === t.name
                    ? `${t.swatch}22`
                    : 'var(--bg-surface-2)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '5px 2px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <span style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: t.swatch,
                  boxShadow: theme === t.name ? `0 0 8px ${t.swatch}88` : 'none',
                  display: 'block',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 8,
                  color: theme === t.name ? t.swatch : 'var(--text-tertiary)',
                  fontWeight: theme === t.name ? 600 : 400,
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}>
                  {t.label}
                </span>
                {theme === t.name && (
                  <span style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: t.swatch,
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
          <span>v1.0 · sample data</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>keys 1–5</span>
        </div>
      </div>
    </aside>
  )
}
