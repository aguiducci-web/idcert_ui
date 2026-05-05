import { render, renderHook, act, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  useSidebar,
  useIsMobile,
} from './index.js'

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

beforeEach(() => {
  setMatchMedia(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function wrapper({ children, ...props }: React.PropsWithChildren<{ defaultOpen?: boolean }>) {
  return <SidebarProvider {...props}>{children}</SidebarProvider>
}

describe('useIsMobile', () => {
  test('returns false when matchMedia matches=false (desktop)', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  test('returns true when matchMedia matches=true (mobile)', () => {
    setMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})

describe('useSidebar', () => {
  test('returns context inside SidebarProvider', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    expect(result.current.state).toBe('expanded')
    expect(typeof result.current.toggleSidebar).toBe('function')
  })

  test('throws when used outside Provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useSidebar())).toThrow(/useSidebar/i)
    errorSpy.mockRestore()
  })

  test('toggleSidebar flips open state', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    act(() => result.current.toggleSidebar())
    expect(result.current.open).toBe(false)
    expect(result.current.state).toBe('collapsed')
  })
})

describe('SidebarProvider', () => {
  test('provides initial state from defaultOpen', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: false }),
    })
    expect(result.current.open).toBe(false)
    expect(result.current.state).toBe('collapsed')
  })

  test('SidebarTrigger keyboard Cmd+B toggles open state', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    act(() => {
      fireEvent.keyDown(window, { key: 'b', metaKey: true })
    })
    expect(result.current.open).toBe(false)
  })

  test('cookie setter is called on toggle', () => {
    const setCookieSpy = vi.fn()
    const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: setCookieSpy,
    })

    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    act(() => result.current.toggleSidebar())
    expect(setCookieSpy).toHaveBeenCalled()
    const lastCall = setCookieSpy.mock.calls.at(-1)?.[0] as string | undefined
    expect(lastCall).toMatch(/sidebar:state=/)

    if (originalDescriptor) {
      Object.defineProperty(document, 'cookie', originalDescriptor)
    }
  })
})

describe('Sidebar', () => {
  test('renders <aside> on desktop', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar data-testid="sidebar">
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('aside')).not.toBeNull()
  })

  test('mobile mode renders inside Sheet (no <aside>)', () => {
    setMatchMedia(true)
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('aside')).toBeNull()
  })

  test('side="right" applies right-side classes (border-l)', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar side="right" data-testid="sidebar">
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const aside = container.querySelector('aside')!
    expect(aside.className).toMatch(/border-l/)
  })

  test('SidebarTrigger click toggles open state', async () => {
    const user = userEvent.setup()
    function Wrapper() {
      const { open } = useSidebar()
      return (
        <>
          <SidebarTrigger aria-label="Toggle" />
          <span data-testid="state">{open ? 'open' : 'closed'}</span>
        </>
      )
    }
    render(
      <SidebarProvider defaultOpen>
        <Wrapper />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('open')
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })

  test('SidebarMenuButton with active prop applies active classes', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton active data-testid="active-btn">Active</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const btn = screen.getByTestId('active-btn')
    expect(btn.className).toMatch(/bg-accent/)
  })

  test('SidebarMenuButton asChild composes child', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/x" data-testid="custom-link">Link</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/x')
  })

  test('SidebarHeader / SidebarContent / SidebarFooter render', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarHeader>HEAD</SidebarHeader>
            <SidebarContent>BODY</SidebarContent>
            <SidebarFooter>FOOT</SidebarFooter>
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByText('HEAD')).toBeInTheDocument()
    expect(screen.getByText('BODY')).toBeInTheDocument()
    expect(screen.getByText('FOOT')).toBeInTheDocument()
  })

  test('SidebarGroup + SidebarGroupLabel render', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>LABEL</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Item</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByText('LABEL')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  test('SidebarMenu renders <ul>', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu data-testid="menu">
                <SidebarMenuItem>
                  <SidebarMenuButton>x</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('ul')).not.toBeNull()
  })

  test('SidebarMenuItem renders <li>', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem data-testid="item">
                  <SidebarMenuButton>x</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('li')).not.toBeNull()
  })

  test('forwards ref to Sidebar root', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      wrapper({
        children: (
          <Sidebar ref={ref}>
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('ASIDE')
  })

  test('SidebarRail renders on desktop', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>x</SidebarContent>
            <SidebarRail data-testid="rail" />
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByTestId('rail')).toBeInTheDocument()
  })

  test('SidebarInset renders main', () => {
    render(
      wrapper({
        children: (
          <SidebarInset data-testid="inset">
            inset content
          </SidebarInset>
        ),
      }),
    )
    expect(screen.getByTestId('inset')).toBeInTheDocument()
    expect(screen.getByText('inset content')).toBeInTheDocument()
  })
})
