import type { Meta, StoryObj } from '@storybook/react'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
        <TooltipContent>Helpful information</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const OnIcon: Story = {
  render: () => (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Info"
            >
              ?
            </button>
          }
        />
        <TooltipContent>Click for more details</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const ControlledOpen: Story = {
  render: () => (
    <TooltipProvider delay={0}>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Always visible</Button>} />
        <TooltipContent>Pinned tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
