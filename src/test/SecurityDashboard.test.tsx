import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeContext } from '../context/ThemeContext'
import SecurityDashboard from '../pages/SecurityDashboard'

function renderSecurity() {
  return render(
    <ThemeContext.Provider value={{ isDark: false, toggle: () => {} }}>
      <SecurityDashboard />
    </ThemeContext.Provider>
  )
}

// ── Render ────────────────────────────────────────────────────────────────

describe('SecurityDashboard — render', () => {
  it('renders the page title', () => {
    renderSecurity()
    expect(screen.getByText('Threat detection')).toBeInTheDocument()
  })

  it('renders all 4 KPI cards', () => {
    renderSecurity()
    expect(screen.getByText('MFA fatigue blocked')).toBeInTheDocument()
    expect(screen.getByText('Geo impossibilities')).toBeInTheDocument()
    // "Integrity violations" appears as KPI label + panel title
    expect(screen.getAllByText('Integrity violations').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Accounts locked')).toBeInTheDocument()
  })

  it('renders the active investigations badge', () => {
    renderSecurity()
    expect(screen.getByRole('button', { name: /active investigations/i })).toBeInTheDocument()
  })

  it('renders the security events table', () => {
    renderSecurity()
    expect(screen.getByText('High-severity security events')).toBeInTheDocument()
  })

  it('renders the integrity violations panel', () => {
    renderSecurity()
    // Panel title "Integrity violations" appears alongside the KPI label
    expect(screen.getAllByText('Integrity violations').length).toBeGreaterThanOrEqual(1)
  })
})

// ── Active Investigations Badge ───────────────────────────────────────────

describe('SecurityDashboard — active investigations badge', () => {
  it('calls scrollIntoView when badge is clicked', () => {
    renderSecurity()
    const badge = screen.getByRole('button', { name: /active investigations/i })
    fireEvent.click(badge)
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })
})

// ── Severity Badge Filter ─────────────────────────────────────────────────

describe('SecurityDashboard — severity filter', () => {
  it('renders severity badges in the events table', () => {
    renderSecurity()
    // At least one severity badge should be rendered
    const criticalBadges = screen.queryAllByRole('button', { name: /critical/i })
    const highBadges     = screen.queryAllByRole('button', { name: /high/i })
    expect(criticalBadges.length + highBadges.length).toBeGreaterThan(0)
  })

  it('shows "✕ clear" in header when a severity is selected', () => {
    renderSecurity()
    const severityBtns = screen.queryAllByRole('button', { name: /critical|high|medium/i })
    if (severityBtns.length === 0) return // no events in mock data
    expect(screen.queryByText(/clear/)).not.toBeInTheDocument()
    fireEvent.click(severityBtns[0])
    expect(screen.getByText(/clear/)).toBeInTheDocument()
  })

  it('clearing the filter restores all events', () => {
    renderSecurity()
    const severityBtns = screen.queryAllByRole('button', { name: /critical|high|medium/i })
    if (severityBtns.length === 0) return
    const initialCount = severityBtns.length
    fireEvent.click(severityBtns[0])
    const clearBtn = screen.queryByText(/clear/)
    if (clearBtn) fireEvent.click(clearBtn)
    const afterCount = screen.queryAllByRole('button', { name: /critical|high|medium/i }).length
    expect(afterCount).toBe(initialCount)
  })

  it('toggling the same badge clears the filter', () => {
    renderSecurity()
    const severityBtns = screen.queryAllByRole('button', { name: /critical|high|medium/i })
    if (severityBtns.length < 1) return
    fireEvent.click(severityBtns[0])
    // Click same button again (outline means it's active)
    const activeBtns = screen.queryAllByRole('button', { name: /critical|high|medium/i })
    fireEvent.click(activeBtns[0])
    expect(screen.queryByText(/clear/)).not.toBeInTheDocument()
  })
})

// ── "open in SIEM" link ───────────────────────────────────────────────────

describe('SecurityDashboard — panel actions', () => {
  it('renders open in SIEM link', () => {
    renderSecurity()
    expect(screen.getByText('open in SIEM ↗')).toBeInTheDocument()
  })
})
