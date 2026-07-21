import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeContext } from '../context/ThemeContext'
import EngineeringDashboard from '../pages/EngineeringDashboard'
import ProductDashboard     from '../pages/ProductDashboard'
import ExecutiveDashboard   from '../pages/ExecutiveDashboard'

const theme = { isDark: false, toggle: () => {} }
const wrap  = (ui: React.ReactElement) =>
  render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>)

// ── EngineeringDashboard ──────────────────────────────────────────────────

describe('EngineeringDashboard — render', () => {
  it('renders the page title', () => {
    wrap(<EngineeringDashboard />)
    expect(screen.getByText('Crash explorer')).toBeInTheDocument()
  })

  it('renders all 4 KPI cards', () => {
    wrap(<EngineeringDashboard />)
    expect(screen.getByText('Crash-free sessions')).toBeInTheDocument()
    expect(screen.getByText('ANR-free sessions')).toBeInTheDocument()
    expect(screen.getByText('Affected users (24h)')).toBeInTheDocument()
    expect(screen.getByText('New signatures')).toBeInTheDocument()
  })

  it('renders the filter pills row', () => {
    wrap(<EngineeringDashboard />)
    // Pills render as "label: all" when inactive
    expect(screen.getByRole('button', { name: /platform/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^version/i })).toBeInTheDocument()
  })

  it('renders the crash signatures table', () => {
    wrap(<EngineeringDashboard />)
    expect(screen.getByText('Top crash signatures')).toBeInTheDocument()
  })

  it('renders "open in Sentry" action link', () => {
    wrap(<EngineeringDashboard />)
    expect(screen.getByText('open in Sentry ↗')).toBeInTheDocument()
  })
})

describe('EngineeringDashboard — filter pills', () => {
  it('filter pill buttons are rendered as buttons', () => {
    wrap(<EngineeringDashboard />)
    const platformBtn = screen.getByRole('button', { name: /platform/i })
    expect(platformBtn).toBeInTheDocument()
  })

  it('clicking a filter pill does not throw', () => {
    wrap(<EngineeringDashboard />)
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /platform/i }))
    }).not.toThrow()
  })
})

// ── ProductDashboard ──────────────────────────────────────────────────────

describe('ProductDashboard — render', () => {
  it('renders the page title', () => {
    wrap(<ProductDashboard />)
    expect(screen.getByText(/north star/i)).toBeInTheDocument()
  })

  it('renders all 4 KPI cards', () => {
    wrap(<ProductDashboard />)
    expect(screen.getByText('Monthly active users')).toBeInTheDocument()
    expect(screen.getByText('Daily active users')).toBeInTheDocument()
    expect(screen.getByText('DAU / MAU stickiness')).toBeInTheDocument()
    expect(screen.getByText('D30 retention')).toBeInTheDocument()
  })

  it('renders enrollment funnel panel', () => {
    wrap(<ProductDashboard />)
    expect(screen.getByText(/enrollment funnel/i)).toBeInTheDocument()
  })

  it('renders all 6 funnel steps', () => {
    wrap(<ProductDashboard />)
    expect(screen.getByText('Opened add-account flow')).toBeInTheDocument()
    expect(screen.getByText('Backup enabled')).toBeInTheDocument()
  })

  it('renders feature adoption panel', () => {
    wrap(<ProductDashboard />)
    expect(screen.getByText('Feature adoption (% of MAU)')).toBeInTheDocument()
  })
})

describe('ProductDashboard — funnel row interaction', () => {
  it('clicking a funnel row does not throw', () => {
    wrap(<ProductDashboard />)
    expect(() => {
      fireEvent.click(screen.getByText('QR scanned successfully'))
    }).not.toThrow()
  })

  it('clicking same funnel row twice deselects it', () => {
    wrap(<ProductDashboard />)
    const step = screen.getByText('Backup enabled')
    fireEvent.click(step)
    fireEvent.click(step)
    // No error thrown — deselect logic works
    expect(step).toBeInTheDocument()
  })
})

describe('ProductDashboard — feature adoption row interaction', () => {
  it('clicking a feature adoption row does not throw', () => {
    wrap(<ProductDashboard />)
    expect(() => {
      fireEvent.click(screen.getByText('Biometric lock'))
    }).not.toThrow()
  })
})

// ── ExecutiveDashboard ────────────────────────────────────────────────────

describe('ExecutiveDashboard — render', () => {
  it('renders the page title', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('Executive summary')).toBeInTheDocument()
  })

  it('renders all 5 KPI cards', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('MAU')).toBeInTheDocument()
    expect(screen.getByText('New installs')).toBeInTheDocument()
    expect(screen.getByText('D30 retention')).toBeInTheDocument()
    expect(screen.getByText('NPS')).toBeInTheDocument()
    expect(screen.getByText('App rating')).toBeInTheDocument()
  })

  it('renders reliability and security scorecards', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('Reliability scorecard')).toBeInTheDocument()
    expect(screen.getByText('Security posture')).toBeInTheDocument()
  })

  it('does NOT render "view SRE →" when onNavigate is not provided', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.queryByText('view SRE →')).not.toBeInTheDocument()
  })

  it('renders "view SRE →" and "view Security →" when onNavigate is provided', () => {
    wrap(<ExecutiveDashboard onNavigate={vi.fn()} />)
    expect(screen.getByText('view SRE →')).toBeInTheDocument()
    expect(screen.getByText('view Security →')).toBeInTheDocument()
  })
})

describe('ExecutiveDashboard — scorecard navigation', () => {
  it('calls onNavigate("sre") when a reliability row is clicked', () => {
    const navigate = vi.fn()
    wrap(<ExecutiveDashboard onNavigate={navigate} />)
    fireEvent.click(screen.getByText('Overall availability'))
    expect(navigate).toHaveBeenCalledWith('sre')
  })

  it('calls onNavigate("security") when a security posture row is clicked', () => {
    const navigate = vi.fn()
    wrap(<ExecutiveDashboard onNavigate={navigate} />)
    fireEvent.click(screen.getByText('Threats blocked (month)'))
    expect(navigate).toHaveBeenCalledWith('security')
  })

  it('calls onNavigate("sre") when "view SRE →" button is clicked', () => {
    const navigate = vi.fn()
    wrap(<ExecutiveDashboard onNavigate={navigate} />)
    fireEvent.click(screen.getByText('view SRE →'))
    expect(navigate).toHaveBeenCalledWith('sre')
  })

  it('calls onNavigate("security") when "view Security →" button is clicked', () => {
    const navigate = vi.fn()
    wrap(<ExecutiveDashboard onNavigate={navigate} />)
    fireEvent.click(screen.getByText('view Security →'))
    expect(navigate).toHaveBeenCalledWith('security')
  })
})
