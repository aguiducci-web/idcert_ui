import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'

function renderTooltip(open?: boolean) {
  return render(
    <TooltipProvider delay={0}>
      <Tooltip open={open}>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Tooltip body</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  )
}

describe('Tooltip', () => {
  test('trigger renders', () => {
    renderTooltip()
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  test('content is hidden initially', () => {
    renderTooltip()
    expect(screen.queryByText('Tooltip body')).not.toBeInTheDocument()
  })

  test('opens on hover', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.hover(screen.getByText('Trigger'))
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('opens on focus', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.tab()
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('respects controlled open prop', async () => {
    renderTooltip(true)
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('TooltipContent merges custom className', async () => {
    render(
      <TooltipProvider delay={0}>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-class">Body</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    await waitFor(() => {
      expect(screen.getByText('Body')).toHaveClass('custom-class')
    })
  })
})
