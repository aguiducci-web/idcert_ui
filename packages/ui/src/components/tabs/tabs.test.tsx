import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './index.js'

function renderTabs(props?: {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills'
}) {
  return render(
    <Tabs defaultValue="account" {...props}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="locked" disabled>Locked</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account body</TabsContent>
      <TabsContent value="password">Password body</TabsContent>
      <TabsContent value="locked">Locked body</TabsContent>
    </Tabs>,
  )
}

describe('Tabs', () => {
  test('renders triggers and the active panel', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Password' })).toBeInTheDocument()
    expect(screen.getByText('Account body')).toBeInTheDocument()
  })

  test('clicking a trigger switches the active panel', async () => {
    const user = userEvent.setup()
    renderTabs()
    await user.click(screen.getByRole('tab', { name: 'Password' }))
    expect(screen.getByText('Password body')).toBeInTheDocument()
  })

  test('controlled mode reflects the passed value', () => {
    renderTabs({ value: 'password' })
    expect(screen.getByText('Password body')).toBeInTheDocument()
  })

  test('controlled onValueChange fires on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderTabs({ value: 'account', onValueChange: onChange })
    await user.click(screen.getByRole('tab', { name: 'Password' }))
    expect(onChange).toHaveBeenCalledWith('password', expect.anything())
  })

  test('vertical orientation applies orientation attr to the list', () => {
    renderTabs({ orientation: 'vertical' })
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })

  test('default variant applies underline classes to the list', () => {
    renderTabs({ variant: 'default' })
    expect(screen.getByRole('tablist')).toHaveClass('border-b')
  })

  test('pills variant applies rounded segment classes to the list', () => {
    renderTabs({ variant: 'pills' })
    expect(screen.getByRole('tablist')).toHaveClass('bg-muted')
  })

  test('disabled trigger does not switch panel on click', async () => {
    const user = userEvent.setup()
    renderTabs()
    const lockedTrigger = screen.getByRole('tab', { name: 'Locked' })
    // Base UI 1.4.1 uses aria-disabled (not native disabled) on Tabs.Tab
    expect(lockedTrigger).toHaveAttribute('aria-disabled', 'true')
    expect(lockedTrigger).toHaveAttribute('data-disabled')
    await user.click(lockedTrigger)
    expect(screen.getByText('Account body')).toBeInTheDocument()
  })

  test('forwards ref to TabsTrigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger ref={ref} value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A body</TabsContent>
      </Tabs>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
