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

function toArray(v: number | number[] | undefined): number[] | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v : [v]
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref,
  ) {
    const valueArr = toArray(value as number | number[] | undefined)
    const defaultValueArr = toArray(defaultValue as number | number[] | undefined)
    const thumbs = valueArr ?? defaultValueArr ?? [0]

    const handleValueChange = React.useMemo(
      () =>
        onValueChange
          ? (v: number | number[]) => onValueChange(Array.isArray(v) ? v : [v])
          : undefined,
      [onValueChange],
    )

    return (
      <BaseSlider.Root
        ref={ref}
        value={valueArr}
        defaultValue={defaultValueArr}
        onValueChange={handleValueChange}
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
