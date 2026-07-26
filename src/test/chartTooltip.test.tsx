import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartTooltip } from '../components/charts/ChartTooltip'

const twoEntries = [
  { dataKey: 'p50', name: 'P50', value: 120, color: '#00e5ff' },
  { dataKey: 'p95', name: 'P95', value: 340, color: '#ff6b6b' },
]

describe('ChartTooltip — null cases', () => {
  it('returns null when active is false', () => {
    const { container } = render(
      <ChartTooltip active={false} payload={twoEntries} label="12:00" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when active is undefined', () => {
    const { container } = render(<ChartTooltip payload={twoEntries} label="12:00" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when payload is an empty array', () => {
    const { container } = render(<ChartTooltip active payload={[]} label="12:00" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when payload is undefined', () => {
    const { container } = render(<ChartTooltip active />)
    expect(container.firstChild).toBeNull()
  })
})

describe('ChartTooltip — renders payload entries', () => {
  it('renders name and raw value for each entry', () => {
    render(<ChartTooltip active payload={twoEntries} />)
    expect(screen.getByText('P50: 120')).toBeInTheDocument()
    expect(screen.getByText('P95: 340')).toBeInTheDocument()
  })

  it('renders the label when provided', () => {
    render(<ChartTooltip active payload={twoEntries} label="12:00 PM" />)
    expect(screen.getByText('12:00 PM')).toBeInTheDocument()
  })

  it('does not render a label element when label prop is omitted', () => {
    render(<ChartTooltip active payload={twoEntries} />)
    expect(screen.queryByText('12:00 PM')).not.toBeInTheDocument()
  })

  it('renders a single entry', () => {
    const single = [{ dataKey: 'val', name: 'Value', value: 99, color: '#fff' }]
    render(<ChartTooltip active payload={single} />)
    expect(screen.getByText('Value: 99')).toBeInTheDocument()
  })
})

describe('ChartTooltip — formatter', () => {
  it('applies formatter function to the value', () => {
    render(
      <ChartTooltip
        active
        payload={twoEntries}
        formatter={v => `${v}ms`}
      />
    )
    expect(screen.getByText('P50: 120ms')).toBeInTheDocument()
    expect(screen.getByText('P95: 340ms')).toBeInTheDocument()
  })

  it('passes both value and name to formatter', () => {
    render(
      <ChartTooltip
        active
        payload={[{ dataKey: 'x', name: 'CPU', value: 75, color: '#0f0' }]}
        formatter={(v, name) => `${name}=${v}%`}
      />
    )
    expect(screen.getByText('CPU: CPU=75%')).toBeInTheDocument()
  })

  it('shows raw numeric value when formatter is not provided', () => {
    render(
      <ChartTooltip
        active
        payload={[{ dataKey: 'v', name: 'Score', value: 42, color: '#f00' }]}
      />
    )
    expect(screen.getByText('Score: 42')).toBeInTheDocument()
  })
})
