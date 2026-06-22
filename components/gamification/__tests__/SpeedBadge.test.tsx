import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SpeedBadge } from '../SpeedBadge'

describe('SpeedBadge', () => {
  it('shows lightning label', () => {
    render(<SpeedBadge rating="lightning" />)
    expect(screen.getByText(/Lightning/i)).toBeInTheDocument()
  })

  it('shows fast label', () => {
    render(<SpeedBadge rating="fast" />)
    expect(screen.getByText(/Fast/i)).toBeInTheDocument()
  })

  it('shows slow label', () => {
    render(<SpeedBadge rating="slow" />)
    expect(screen.getByText(/Slow/i)).toBeInTheDocument()
  })
})
