import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeContext } from '../context/ThemeContext'
import SREDashboard from '../pages/SREDashboard'

function renderSRE() {
  return render(
    <ThemeContext.Provider value={{ isDark: false, toggle: () => {} }}>
      <SREDashboard />
    </ThemeContext.Provider>
  )
}

// ── Render ────────────────────────────────────────────────────────────────

describe('SREDashboard — render', () => {
  it('renders the page title', () => {
    renderSRE()
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })

  it('renders all 4 KPI cards', () => {
    renderSRE()
    expect(screen.getByText('Crash-free sessions')).toBeInTheDocument()
    // "API availability" also appears in burn rates — target the KPI label specifically
    expect(screen.getAllByText('API availability').length).toBeGreaterThan(0)
    // "Push delivery" appears in KPI + burn panel
    expect(screen.getAllByText('Push delivery').length).toBeGreaterThan(0)
    expect(screen.getByText('Time-to-code p95')).toBeInTheDocument()
  })

  it('renders all 5 dependency rows', () => {
    renderSRE()
    expect(screen.getByText('APNs')).toBeInTheDocument()
    expect(screen.getByText('FCM')).toBeInTheDocument()
    expect(screen.getByText('Primary DB')).toBeInTheDocument()
    expect(screen.getByText('Redis cache')).toBeInTheDocument()
    expect(screen.getByText('Identity IdP')).toBeInTheDocument()
  })

  it('renders the Active alerts panel', () => {
    renderSRE()
    expect(screen.getByText('Active alerts')).toBeInTheDocument()
  })

  it('renders the SLO burn rates panel', () => {
    renderSRE()
    expect(screen.getByText('SLO burn rates (1h window)')).toBeInTheDocument()
  })
})

// ── Golden Signal Filter ──────────────────────────────────────────────────

describe('SREDashboard — golden signal filter', () => {
  it('renders all 4 golden signal pills', () => {
    renderSRE()
    expect(screen.getByText('Latency')).toBeInTheDocument()
    expect(screen.getByText('Traffic')).toBeInTheDocument()
    expect(screen.getByText('Errors')).toBeInTheDocument()
    expect(screen.getByText('Saturation')).toBeInTheDocument()
  })

  it('shows "✕ clear" button when a signal is selected', () => {
    renderSRE()
    expect(screen.queryByText(/clear/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Errors'))
    expect(screen.getByText(/clear/)).toBeInTheDocument()
  })

  it('hides "✕ clear" button after deselecting via the same pill', () => {
    renderSRE()
    fireEvent.click(screen.getByText('Latency'))
    fireEvent.click(screen.getByText('● Latency'))
    expect(screen.queryByText(/clear/)).not.toBeInTheDocument()
  })

  it('clears filter when "✕ clear" is clicked', () => {
    renderSRE()
    fireEvent.click(screen.getByText('Traffic'))
    fireEvent.click(screen.getByText(/clear/))
    expect(screen.queryByText(/clear/)).not.toBeInTheDocument()
  })
})

// ── Severity Badge Filter ─────────────────────────────────────────────────

describe('SREDashboard — severity badge filter', () => {
  it('renders severity badges in the alerts table', () => {
    renderSRE()
    expect(screen.getByRole('button', { name: 'page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'warn' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'info' })).toBeInTheDocument()
  })

  it('clicking "page" badge shows clear filter in Severity column header', () => {
    renderSRE()
    fireEvent.click(screen.getByRole('button', { name: 'page' }))
    expect(screen.getAllByText(/clear/).length).toBeGreaterThan(0)
  })

  it('filters alerts to only the selected severity', () => {
    renderSRE()
    // Click the "info" badge — only 1 info alert exists
    fireEvent.click(screen.getByRole('button', { name: 'info' }))
    expect(screen.getByText('Release v4.12.1 rollout at 47% (3.2M users)')).toBeInTheDocument()
    expect(screen.queryByText('Push delivery SLO burn 6.8× — FCM Asia region')).not.toBeInTheDocument()
  })

  it('toggles filter off when same badge is clicked again', () => {
    renderSRE()
    fireEvent.click(screen.getByRole('button', { name: 'warn' }))
    fireEvent.click(screen.getByRole('button', { name: 'warn' }))
    // All 3 alerts should be visible again
    expect(screen.getByText('Push delivery SLO burn 6.8× — FCM Asia region')).toBeInTheDocument()
    expect(screen.getByText('Release v4.12.1 rollout at 47% (3.2M users)')).toBeInTheDocument()
  })
})

// ── Dependency Row Highlight ──────────────────────────────────────────────

describe('SREDashboard — dependency row highlight', () => {
  it('dep rows are present and clickable', () => {
    renderSRE()
    const fcmRow = screen.getByText('FCM').closest('[class*="dep-row"]') ??
                   screen.getByText('FCM').closest('div[style*="cursor"]')
    expect(fcmRow).toBeInTheDocument()
  })

  it('clicking a dep row does not throw', () => {
    renderSRE()
    expect(() => {
      fireEvent.click(screen.getByText('APNs'))
    }).not.toThrow()
  })
})
