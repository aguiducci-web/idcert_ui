'use client'
import * as React from 'react'
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  type MultiSelectOption,
} from './index.js'
import { Label } from '../label/index.js'

const countries: MultiSelectOption[] = [
  { value: 'it', label: 'Italy' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'de', label: 'Germany' },
  { value: 'pt', label: 'Portugal' },
]

export const Default = () => (
  <div className="w-80">
    <MultiSelect items={countries} placeholder="Pick countries…">
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>
  </div>
)

export const WithLabel = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="ms-countries">Countries</Label>
    <MultiSelect items={countries} placeholder="Pick countries…">
      <MultiSelectTrigger id="ms-countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>
  </div>
)

export const Searchable = () => (
  <div className="w-80">
    <MultiSelect items={countries} placeholder="Type to filter…">
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No matches</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>
  </div>
)

export const Disabled = () => (
  <div className="w-80">
    <MultiSelect
      items={countries}
      defaultValue={['it', 'fr']}
      placeholder="Pick countries…"
      disabled
    >
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>
  </div>
)

export const WithMaxSelection = () => {
  const MAX = 3
  const [value, setValue] = React.useState<string[]>([])
  return (
    <div className="flex w-80 flex-col gap-1">
      <MultiSelect
        items={countries}
        value={value}
        onValueChange={(next) => {
          if (next.length <= MAX) setValue(next)
        }}
        placeholder={value.length >= MAX ? 'Limit reached' : 'Pick up to 3…'}
      >
        <MultiSelectTrigger aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectEmpty>No results</MultiSelectEmpty>
          <MultiSelectList>
            {(item) => (
              <MultiSelectItem key={item.value} value={item.value}>
                {item.label}
              </MultiSelectItem>
            )}
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>
      <span className="text-xs text-muted-foreground">
        {value.length} / {MAX} selected
      </span>
    </div>
  )
}
