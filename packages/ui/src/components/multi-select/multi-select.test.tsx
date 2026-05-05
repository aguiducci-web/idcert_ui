import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  type MultiSelectOption,
} from './index.js'

const items: MultiSelectOption[] = [
  { value: 'it', label: 'Italy' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
]

function renderMS(props?: {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (v: string[]) => void
  disabled?: boolean
}) {
  return render(
    <MultiSelect items={items} placeholder="Pick…" {...props}>
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>,
  )
}

async function openMS(): Promise<HTMLInputElement> {
  const user = userEvent.setup()
  const input = screen.getByPlaceholderText('Pick…') as HTMLInputElement
  await user.click(input)
  await waitFor(() => {
    expect(input.getAttribute('aria-expanded')).toBe('true')
  })
  return input
}

describe('MultiSelect', () => {
  test('renders trigger with placeholder when empty', () => {
    renderMS()
    expect(screen.getByPlaceholderText('Pick…')).toBeInTheDocument()
  })

  test('opens on click and shows items', async () => {
    renderMS()
    await openMS()
    await waitFor(() => {
      expect(screen.getByText('Italy')).toBeInTheDocument()
      expect(screen.getByText('France')).toBeInTheDocument()
    })
  })

  test('selecting items adds them to the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ onValueChange: onChange })
    await openMS()
    await user.click(await screen.findByText('Italy'))
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(['it'])
    })
    // Re-open if it closed
    const input = screen.getByPlaceholderText('Pick…') as HTMLInputElement
    if (input.getAttribute('aria-expanded') !== 'true') {
      await user.click(input)
      await waitFor(() => {
        expect(input.getAttribute('aria-expanded')).toBe('true')
      })
    }
    await user.click(await screen.findByText('France'))
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(['it', 'fr'])
    })
  })

  test('chip remove button removes the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ defaultValue: ['it', 'fr'], onValueChange: onChange })
    const removeItalyBtn = screen.getByRole('button', { name: 'Remove Italy' })
    await user.click(removeItalyBtn)
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(['fr'])
    })
  })

  test('backspace on empty input removes last chip', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ defaultValue: ['it', 'fr'], onValueChange: onChange })
    const input = screen.getByPlaceholderText('Pick…')
    await user.click(input)
    await user.keyboard('{Backspace}')
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(['it'])
    })
  })

  test('filter input narrows visible items', async () => {
    const user = userEvent.setup()
    renderMS()
    const input = await openMS()
    await user.type(input, 'fra')
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument()
      expect(screen.queryByText('Italy')).not.toBeInTheDocument()
    })
  })

  test('empty state visible when filter matches nothing', async () => {
    const user = userEvent.setup()
    renderMS()
    const input = await openMS()
    await user.type(input, 'zzz')
    await waitFor(() => {
      expect(screen.getByText('No results')).toBeInTheDocument()
    })
  })

  test('controlled mode reflects passed value as chips', () => {
    renderMS({ value: ['it'] })
    expect(screen.getByText('Italy')).toBeInTheDocument()
  })

  test('disabled prevents interactions', async () => {
    const user = userEvent.setup()
    renderMS({ disabled: true })
    const input = screen.getByPlaceholderText('Pick…')
    expect(input).toBeDisabled()
    await user.click(input)
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
  })

  test('forwards ref to trigger root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MultiSelect items={items}>
        <MultiSelectTrigger ref={ref} aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectList>
            {(item) => (
              <MultiSelectItem key={item.value} value={item.value}>
                {item.label}
              </MultiSelectItem>
            )}
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
