import type { Meta, StoryObj } from '@storybook/react'
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

const countries: MultiSelectOption[] = [
  { value: 'it', label: 'Italy' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'de', label: 'Germany' },
  { value: 'pt', label: 'Portugal' },
  { value: 'us', label: 'USA' },
  { value: 'br', label: 'Brazil' },
  { value: 'jp', label: 'Japan' },
]

const manyCountries: MultiSelectOption[] = Array.from({ length: 30 }, (_, i) => ({
  value: `c${i}`,
  label: `Country ${i + 1}`,
}))

const meta = {
  title: 'Form/MultiSelect',
  component: MultiSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { items: countries },
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
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
  ),
}

function ControlledDemo(): React.JSX.Element {
  const [value, setValue] = React.useState<string[]>(['it', 'fr'])
  return (
    <div className="w-80 space-y-2">
      <MultiSelect
        items={countries}
        value={value}
        onValueChange={setValue}
        placeholder="Pick countries…"
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
      <div className="text-sm text-muted-foreground">
        Value: {value.join(', ') || '(none)'}
      </div>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const ManyOptions: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect items={manyCountries} placeholder="Search 30 options…">
        <MultiSelectTrigger aria-label="Many countries">
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
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect
        items={countries}
        defaultValue={['it', 'fr']}
        disabled
        placeholder="Pick countries…"
      >
        <MultiSelectTrigger aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
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
  ),
}
