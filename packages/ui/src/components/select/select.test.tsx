import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './index.js'

function renderSelect(props?: {
  value?: string
  onValueChange?: (v: string) => void
  defaultValue?: string
  disabled?: boolean
  items?: Record<string, React.ReactNode>
}) {
  return render(
    <Select {...props}>
      <SelectTrigger aria-label="Country">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="us">USA</SelectItem>
      </SelectContent>
    </Select>,
  )
}

async function openSelect(): Promise<HTMLElement> {
  const user = userEvent.setup()
  const trigger = screen.getByRole('combobox', { name: 'Country' })
  await user.click(trigger)
  await waitFor(() => {
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
  return trigger
}

describe('Select', () => {
  test('renders trigger with placeholder when no value', () => {
    renderSelect()
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Choose…',
    )
  })

  test('opens on click and shows items', async () => {
    renderSelect()
    await openSelect()
    expect(screen.getByText('Italy')).toBeInTheDocument()
    expect(screen.getByText('France')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
  })

  test('selecting an item updates value via onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderSelect({ onValueChange: onChange })
    await openSelect()
    await user.click(await screen.findByText('Italy'))
    expect(onChange).toHaveBeenCalledWith('it')
  })

  test('controlled mode reflects passed value', async () => {
    // Base UI 1.4 resolves the displayed label via the `items` mapping when
    // the value is a primitive. Without `items`, the trigger renders the raw
    // value. We pass `items` so that value="fr" renders as "France".
    renderSelect({
      value: 'fr',
      items: { it: 'Italy', fr: 'France', us: 'USA' },
    })
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Country' }),
      ).toHaveTextContent('France')
    })
  })

  test('disabled prevents opening', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })
    const trigger = screen.getByRole('combobox', { name: 'Country' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
  })

  test('placeholder shown when value is empty string', () => {
    renderSelect({ value: '' })
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Choose…',
    )
  })

  test('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Select>
        <SelectTrigger ref={ref} aria-label="Country">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('group label and separator render', async () => {
    renderSelect()
    await openSelect()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    // separator has role="separator" via Base UI
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
