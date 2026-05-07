'use client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
      <TooltipContent>Helpful information</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
