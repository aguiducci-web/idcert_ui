'use client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'
import { Button } from '../button/index.js'
import { Trash2 } from 'lucide-react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn.js'

export const Default = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
      <TooltipContent>Helpful information</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export const OnIconButton = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Delete">
            <Trash2 className="size-4" />
          </Button>
        }
      />
      <TooltipContent>Delete</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const SidePopup = ({ side, label }: { side: 'top' | 'right' | 'bottom' | 'left'; label: string }) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner side={side} sideOffset={6}>
      <BaseTooltip.Popup
        role="tooltip"
        className={cn(
          'z-50 overflow-hidden rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-md',
          'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
          'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
        )}
      >
        {label}
      </BaseTooltip.Popup>
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
)

export const Sides = () => (
  <TooltipProvider delay={0}>
    <div className="flex flex-wrap items-center justify-center gap-3 py-12">
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Top</Button>} />
        <SidePopup side="top" label="Top tooltip" />
      </Tooltip>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Right</Button>} />
        <SidePopup side="right" label="Right tooltip" />
      </Tooltip>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Bottom</Button>} />
        <SidePopup side="bottom" label="Bottom tooltip" />
      </Tooltip>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Left</Button>} />
        <SidePopup side="left" label="Left tooltip" />
      </Tooltip>
    </div>
  </TooltipProvider>
)

export const WithDelay = () => (
  <TooltipProvider delay={800}>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover and wait</Button>} />
      <TooltipContent>Appeared after 800ms</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export const Disabled = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger
        render={
          <span tabIndex={0} className="inline-block">
            <Button variant="outline" disabled>
              Disabled action
            </Button>
          </span>
        }
      />
      <TooltipContent>Sign in to enable this action</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
