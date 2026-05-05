'use client'

import * as React from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cn } from '../../lib/cn.js'

export type SliderProps = Omit<
  React.ComponentProps<typeof BaseSlider.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref,
  ) {
    const thumbs = value ?? defaultValue ?? [0]

    return (
      <BaseSlider.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        <BaseSlider.Control className="relative flex h-5 w-full items-center">
          <BaseSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <BaseSlider.Indicator className="absolute h-full bg-primary" />
          </BaseSlider.Track>
          {thumbs.map((_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={index}
              className={cn(
                'block h-5 w-5 rounded-full border-2 border-primary bg-background shadow',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'data-[disabled]:pointer-events-none',
              )}
            />
          ))}
        </BaseSlider.Control>
      </BaseSlider.Root>
    )
  },
)
