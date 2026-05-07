'use client'
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
