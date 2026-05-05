import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Progress } from './index.js'

describe('Progress', () => {
  test('renders with role progressbar', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  test('value=60 sets aria-valuenow=60', () => {
    render(<Progress value={60} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
  })

  test('value=null indeterminate state has no aria-valuenow', () => {
    render(<Progress value={null} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  test('custom max changes ARIA scale', () => {
    render(<Progress value={120} max={200} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '200')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '120')
  })

  test('value=100 sets data-complete on track', () => {
    const { container } = render(<Progress value={100} />)
    expect(container.querySelector('[data-complete]')).not.toBeNull()
  })

  test('forwards ref to root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
