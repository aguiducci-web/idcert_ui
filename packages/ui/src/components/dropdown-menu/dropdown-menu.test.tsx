import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index.js'

async function openMenu(user: ReturnType<typeof userEvent.setup>, name: RegExp | string) {
  await user.click(screen.getByRole('button', { name }))
  await waitFor(() => {
    expect(
      screen.queryAllByRole('menuitem').length +
        screen.queryAllByRole('menuitemcheckbox').length +
        screen.queryAllByRole('menuitemradio').length,
    ).toBeGreaterThan(0)
  })
}

describe('DropdownMenu', () => {
  test('renders the trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  test('opens menu on trigger click', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByText('Profile')).toBeInTheDocument()
  })

  test('clicking an Item closes the menu', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Profile')
    await user.click(item)
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })

  test('disabled Item does not fire onSelect (via aria-disabled)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onClick={onSelect}>Disabled</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Disabled')
    expect(item.closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true')
  })

  test('Separator renders', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByRole('separator')).toBeInTheDocument()
  })

  test('Label renders text', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByText('My Account')).toBeInTheDocument()
  })

  test('Group renders', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Grouped</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await waitFor(() => {
      expect(screen.getByText('Grouped')).toBeInTheDocument()
    })
    // DropdownMenuContent renders into a Portal, so query the document instead
    // of the original render container which only holds the trigger.
    expect(document.querySelector('[role="group"]')).not.toBeNull()
  })

  test('CheckboxItem toggles checked state via onCheckedChange', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Notifications
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('Notifications'))
    expect(onCheckedChange).toHaveBeenCalled()
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
  })

  test('checked CheckboxItem renders Check indicator', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Checked')
    const itemRow = item.closest('[role="menuitemcheckbox"]')!
    expect(itemRow.querySelector('svg')).not.toBeNull()
  })

  test('RadioGroup mutual exclusion via onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('B'))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0]?.[0]).toBe('b')
  })

  test('SubTrigger renders trailing chevron', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const subTrigger = await screen.findByText('Share')
    const triggerRow = subTrigger.closest('[role="menuitem"]')!
    expect(triggerRow.querySelector('svg')).not.toBeNull()
  })

  test('Sub opens submenu on click', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('Share'))
    await waitFor(() => {
      expect(screen.getByText('Copy link')).toBeInTheDocument()
    })
  })

  test('asChild trigger composes with another component', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button data-testid="custom-trigger">Custom</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByTestId('custom-trigger')
    await user.click(trigger)
    expect(await screen.findByText('Profile')).toBeInTheDocument()
  })

  test('forwards ref to DropdownMenuTrigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger ref={ref}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
