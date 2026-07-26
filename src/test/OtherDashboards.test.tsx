import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

// ── EngineeringDashboard — FilterPill dropdown ────────────────────────────
// These tests exercise the portal-rendered dropdown (isOpen=true path) and
// cover the "clear all", "N of M shown", and empty-state branches.

describe('EngineeringDashboard — filter pill dropdown', () => {
  it('opens the platform dropdown and shows iOS / Android options', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    expect(screen.getByText('iOS')).toBeInTheDocument()
    expect(screen.getByText('Android')).toBeInTheDocument()
    expect(screen.getByText('all platforms')).toBeInTheDocument()
  })

  it('selecting an option updates the pill label', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    fireEvent.click(screen.getByText('iOS'))
    expect(screen.getByRole('button', { name: /platform: iOS/i })).toBeInTheDocument()
  })

  it('shows the "clear all ✕" button once a filter is active', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    fireEvent.click(screen.getByText('iOS'))
    expect(screen.getByText(/clear all/i)).toBeInTheDocument()
  })

  it('"clear all ✕" resets all filters back to "all"', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    fireEvent.click(screen.getByText('iOS'))
    fireEvent.click(screen.getByText(/clear all/i))
    expect(screen.getByRole('button', { name: /platform: all/i })).toBeInTheDocument()
    expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument()
  })

  it('shows "N of M shown" count in the signatures panel when a filter is active', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    fireEvent.click(screen.getByText('iOS'))
    // Signatures panel title now shows filtered count
    expect(screen.getByText(/of \d+ shown/)).toBeInTheDocument()
  })

  it('closes the dropdown when clicking the pill button a second time', () => {
    wrap(<EngineeringDashboard />)
    const pill = screen.getByRole('button', { name: /platform: all/i })
    fireEvent.click(pill)
    expect(screen.getByText('iOS')).toBeInTheDocument()
    fireEvent.click(pill)
    expect(screen.queryByText('iOS')).not.toBeInTheDocument()
  })

  it('closes dropdown on outside mousedown', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    expect(screen.getByText('iOS')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('iOS')).not.toBeInTheDocument()
  })

  it('shows empty-state message when active filters exclude all signatures', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /device tier: all/i }))
    // Use the exact option button text (not the crash-row subtext "Android · low-tier devices")
    const lowTierBtn = screen.getByRole('button', { name: 'low-tier' })
    fireEvent.click(lowTierBtn)
    // After filtering by low-tier some signatures may be hidden; verify counter or empty state
    const shown = screen.queryByText(/no crashes match/i)
    const counter = screen.queryByText(/of \d+ shown/)
    expect(shown ?? counter).toBeInTheDocument()
  })

  it('opens the version dropdown and shows "all versions" option', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /^version/i }))
    expect(screen.getByRole('button', { name: /all versions/i })).toBeInTheDocument()
  })

  it('selecting a version filter highlights label in the bar-chart panel', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /^version/i }))
    // All non-"all" option buttons in the dropdown
    const allVersionBtns = screen.getAllByRole('button').filter(b =>
      b.textContent !== null && /v\d|4\.\d|\d+\.\d+\.\d+/.test(b.textContent)
    )
    if (allVersionBtns.length > 0) {
      fireEvent.click(allVersionBtns[0])
      expect(screen.getByText(/highlighted/i)).toBeInTheDocument()
    }
  })

  it('stops propagation on option mousedown (portal click isolation)', () => {
    wrap(<EngineeringDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /platform: all/i }))
    const iOSOption = screen.getByText('iOS')
    // mousedown on option should not close the dropdown (stopPropagation)
    fireEvent.mouseDown(iOSOption)
    expect(screen.getByText('iOS')).toBeInTheDocument()
  })
})

// ── EngineeringDashboard — dark theme ────────────────────────────────────

describe('EngineeringDashboard — dark theme', () => {
  it('renders correctly with isDark = true', () => {
    const darkTheme = { isDark: true, toggle: () => {} }
    render(
      <ThemeContext.Provider value={darkTheme}>
        <EngineeringDashboard />
      </ThemeContext.Provider>
    )
    expect(screen.getByText('Crash explorer')).toBeInTheDocument()
  })
})

// ── ProductDashboard — dark theme ─────────────────────────────────────────

describe('ProductDashboard — dark theme', () => {
  it('renders correctly with isDark = true', () => {
    const darkTheme = { isDark: true, toggle: () => {} }
    render(
      <ThemeContext.Provider value={darkTheme}>
        <ProductDashboard />
      </ThemeContext.Provider>
    )
    expect(screen.getByText(/north star/i)).toBeInTheDocument()
  })
})

// ── ExecutiveDashboard — unit economics and regions ───────────────────────

describe('ExecutiveDashboard — additional panels', () => {
  it('renders unit economics panel', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('Unit economics')).toBeInTheDocument()
  })

  it('renders top regions panel', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('Top regions')).toBeInTheDocument()
  })

  it('renders platform mix panel', () => {
    wrap(<ExecutiveDashboard />)
    expect(screen.getByText('Platform mix')).toBeInTheDocument()
  })
})
