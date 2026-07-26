import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from '../components/layout/Layout'

describe('Layout', () => {
  it('renders children unchanged', () => {
    render(<Layout><span>Hello World</span></Layout>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <Layout>
        <span>First</span>
        <span>Second</span>
      </Layout>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
