import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

// ── Full App integration tests ────────────────────────────────────────────

describe('App — initial render', () => {
  it('renders SRE dashboard by default', () => {
    render(<App />)
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })

  it('renders the sidebar navigation buttons', () => {
    render(<App />)
    // Sidebar buttons have accessible name = label + shortcut (e.g. "Engineering 2")
    expect(screen.getByRole('button', { name: /engineering/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /product/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /executive/i })).toBeInTheDocument()
  })

  it('renders the demo banner', () => {
    render(<App />)
    expect(screen.getAllByText(/sample data/i).length).toBeGreaterThan(0)
  })
})

// ── Sidebar navigation ────────────────────────────────────────────────────

describe('App — sidebar navigation', () => {
  it('navigates to Engineering dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /engineering/i }))
    // Engineering dashboard shows "Crash explorer" as its page title
    expect(screen.getByText('Crash explorer')).toBeInTheDocument()
  })

  it('navigates to Product dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /product/i }))
    expect(screen.getByText(/north star/i)).toBeInTheDocument()
  })

  it('navigates to Security dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /security/i }))
    expect(screen.getByText('Threat detection')).toBeInTheDocument()
  })

  it('navigates to Executive dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /executive/i }))
    expect(screen.getByText('Executive summary')).toBeInTheDocument()
  })

  it('navigates back to SRE dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /engineering/i }))
    // SRE button accessible name includes "1" shortcut
    fireEvent.click(screen.getByRole('button', { name: /^sre/i }))
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })
})

// ── Keyboard navigation (1–5) ─────────────────────────────────────────────

describe('App — keyboard navigation', () => {
  it('pressing "2" navigates to Engineering', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '2' })
    expect(screen.getByText('Crash explorer')).toBeInTheDocument()
  })

  it('pressing "3" navigates to Product', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '3' })
    expect(screen.getByText(/north star/i)).toBeInTheDocument()
  })

  it('pressing "4" navigates to Security', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '4' })
    expect(screen.getByText('Threat detection')).toBeInTheDocument()
  })

  it('pressing "5" navigates to Executive', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '5' })
    expect(screen.getByText('Executive summary')).toBeInTheDocument()
  })

  it('pressing "1" navigates back to SRE', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '2' })
    fireEvent.keyDown(window, { key: '1' })
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })

  it('ignores key presses with modifier keys held', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '2', metaKey: true })
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })

  it('ignores unknown keys', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '9' })
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })
})

// ── Theme toggle ──────────────────────────────────────────────────────────

describe('App — theme picker', () => {
  it('renders all 5 theme swatch buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Midnight' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forest' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dusk' })).toBeInTheDocument()
  })

  it('clicking each theme swatch does not throw', () => {
    render(<App />)
    const swatches = ['Dark', 'Light', 'Midnight', 'Forest', 'Dusk']
    for (const name of swatches) {
      expect(() =>
        fireEvent.click(screen.getByRole('button', { name }))
      ).not.toThrow()
    }
  })

  it('clicking a theme swatch sets data-theme on the document root', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Midnight' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
    fireEvent.click(screen.getByRole('button', { name: 'Light' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

// ── Executive Dashboard onNavigate integration ────────────────────────────

describe('App — Executive dashboard navigation integration', () => {
  it('clicking a reliability row from Executive navigates to SRE', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '5' })
    expect(screen.getByText('Executive summary')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Overall availability'))
    expect(screen.getByText('Service health overview')).toBeInTheDocument()
  })

  it('clicking a security posture row from Executive navigates to Security', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '5' })
    fireEvent.click(screen.getByText('Threats blocked (month)'))
    expect(screen.getByText('Threat detection')).toBeInTheDocument()
  })
})
