'use client'

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

type TabsVariant = 'default' | 'pills'

const TabsVariantContext = React.createContext<TabsVariant>('default')

export type TabsProps = React.ComponentProps<typeof BaseTabs.Root> & {
  variant?: TabsVariant
}

export function Tabs({ variant = 'default', children, ...props }: TabsProps): React.JSX.Element {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root {...props}>{children}</BaseTabs.Root>
    </TabsVariantContext.Provider>
  )
}

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default: 'h-10 w-full justify-start border-b border-border',
      pills: 'h-10 justify-start rounded-md bg-muted p-1',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type TabsListProps = React.ComponentProps<typeof BaseTabs.List>

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    const variant = React.useContext(TabsVariantContext)
    return (
      <BaseTabs.List
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

// Base UI 1.4.1 marks the active tab with `data-active` (not `data-selected`).
// See @base-ui/react/tabs/tab/TabsTabDataAttributes.
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-10 px-3 -mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[active]:border-primary data-[active]:text-foreground',
        pills:
          'h-8 rounded-sm px-3 text-muted-foreground data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type TabsTriggerProps = React.ComponentProps<typeof BaseTabs.Tab> &
  VariantProps<typeof tabsTriggerVariants>

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, ...props }, ref) {
    const variant = React.useContext(TabsVariantContext)
    return (
      <BaseTabs.Tab
        ref={ref}
        className={cn(tabsTriggerVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

export type TabsContentProps = React.ComponentProps<typeof BaseTabs.Panel>

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        ref={ref}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      />
    )
  },
)
