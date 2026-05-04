import type { Meta, StoryObj } from '@storybook/react'
import { Radio, RadioGroup } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Radio',
  component: Radio,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = { args: { name: 'g', value: 'a', 'aria-label': 'Option' } }

export const Group: Story = {
  render: () => (
    <RadioGroup aria-label="Pick one">
      <div className="flex items-center gap-2">
        <Radio id="r1" name="grp" value="a" />
        <Label htmlFor="r1">Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="r2" name="grp" value="b" />
        <Label htmlFor="r2">Option B</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="r3" name="grp" value="c" />
        <Label htmlFor="r3">Option C</Label>
      </div>
    </RadioGroup>
  ),
}
