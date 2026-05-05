'use client'

import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { Check, X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type MultiSelectOption<TValue extends string = string> = {
  value: TValue
  label: React.ReactNode
  disabled?: boolean
}

type MultiSelectContextValue = {
  items: MultiSelectOption[]
  value: string[]
  setValue: (v: string[]) => void
  disabled?: boolean
  placeholder?: string
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(null)

function useMultiSelect(): MultiSelectContextValue {
  const ctx = React.useContext(MultiSelectContext)
  if (!ctx) {
    throw new Error('MultiSelect sub-parts must be used inside <MultiSelect>.')
  }
  return ctx
}

export type MultiSelectProps = {
  items: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
  children?: React.ReactNode
}

export function MultiSelect({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  placeholder,
  children,
}: MultiSelectProps): React.JSX.Element {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(
    defaultValue ?? [],
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const setValue = React.useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const ctx = React.useMemo<MultiSelectContextValue>(
    () => ({ items, value, setValue, disabled, placeholder }),
    [items, value, setValue, disabled, placeholder],
  )

  // Wrap Base UI's `(value, eventDetails) => void` into `(value) => void`
  // so consumers receive only the new value array.
  const handleBaseValueChange = React.useCallback(
    (next: string[]) => {
      setValue(next)
    },
    [setValue],
  )

  return (
    <MultiSelectContext.Provider value={ctx}>
      <BaseCombobox.Root<string, true>
        items={items}
        multiple
        value={value}
        onValueChange={handleBaseValueChange}
        disabled={disabled}
      >
        {children}
      </BaseCombobox.Root>
    </MultiSelectContext.Provider>
  )
}

export type MultiSelectTriggerProps = React.HTMLAttributes<HTMLDivElement>

export const MultiSelectTrigger = React.forwardRef<
  HTMLDivElement,
  MultiSelectTriggerProps
>(function MultiSelectTrigger({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        'max-h-32 overflow-y-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export type MultiSelectChipsProps = {
  className?: string
}

export function MultiSelectChips({
  className,
}: MultiSelectChipsProps): React.JSX.Element {
  const { items, value, setValue, disabled, placeholder } = useMultiSelect()

  const labelFor = React.useCallback(
    (val: string): React.ReactNode =>
      items.find((i) => i.value === val)?.label ?? val,
    [items],
  )

  return (
    <>
      {value.map((val) => {
        const label = labelFor(val)
        const labelText = typeof label === 'string' ? label : val
        return (
          <span
            key={val}
            className={cn(
              'inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs text-secondary-foreground',
              className,
            )}
          >
            <span>{label}</span>
            <button
              type="button"
              aria-label={`Remove ${labelText}`}
              disabled={disabled}
              onMouseDown={(e) => {
                // Prevent the input from losing focus when clicking the chip remove button.
                e.preventDefault()
              }}
              onClick={(e) => {
                e.stopPropagation()
                setValue(value.filter((v) => v !== val))
              }}
              className="inline-flex h-3 w-3 items-center justify-center rounded-sm hover:bg-muted-foreground/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden="true" className="h-3 w-3" />
            </button>
          </span>
        )
      })}
      <BaseCombobox.Input
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (
            e.key === 'Backspace' &&
            e.currentTarget.value === '' &&
            value.length > 0
          ) {
            e.preventDefault()
            setValue(value.slice(0, -1))
          }
        }}
      />
    </>
  )
}

export type MultiSelectContentProps = React.ComponentProps<
  typeof BaseCombobox.Popup
> & {
  sideOffset?: number
}

export const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  MultiSelectContentProps
>(function MultiSelectContent(
  { className, children, sideOffset = 4, ...props },
  ref,
) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner sideOffset={sideOffset} className="outline-none">
        <BaseCombobox.Popup
          ref={ref}
          className={cn(
            'z-50 max-h-72 min-w-[var(--anchor-width)] overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
            'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
            'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
            className,
          )}
          {...props}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
})

export type MultiSelectListProps = {
  children: (item: MultiSelectOption) => React.ReactNode
}

export function MultiSelectList({
  children,
}: MultiSelectListProps): React.JSX.Element {
  return (
    <BaseCombobox.List>
      {(item: MultiSelectOption) => children(item)}
    </BaseCombobox.List>
  )
}

export type MultiSelectItemProps = React.ComponentProps<
  typeof BaseCombobox.Item
>

export const MultiSelectItem = React.forwardRef<
  HTMLDivElement,
  MultiSelectItemProps
>(function MultiSelectItem({ className, children, ...props }, ref) {
  return (
    <BaseCombobox.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <BaseCombobox.ItemIndicator>
          <Check aria-hidden="true" className="h-4 w-4" />
        </BaseCombobox.ItemIndicator>
      </span>
      {children}
    </BaseCombobox.Item>
  )
})

export type MultiSelectEmptyProps = React.ComponentProps<
  typeof BaseCombobox.Empty
>

export function MultiSelectEmpty({
  className,
  ...props
}: MultiSelectEmptyProps): React.JSX.Element {
  return (
    <BaseCombobox.Empty
      className={cn('px-3 py-2 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
