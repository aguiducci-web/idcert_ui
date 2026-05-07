'use client'
import { Radio, RadioGroup } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
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
)

export const WithLabel = () => (
  <div className="flex items-center gap-2">
    <Radio id="rwl" name="rwl" value="yes" defaultChecked />
    <Label htmlFor="rwl">Email me product updates</Label>
  </div>
)

export const Group = () => (
  <RadioGroup aria-label="Plan">
    <div className="flex items-center gap-2">
      <Radio id="plan-free" name="plan" value="free" />
      <Label htmlFor="plan-free">Free</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="plan-pro" name="plan" value="pro" />
      <Label htmlFor="plan-pro">Pro</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="plan-team" name="plan" value="team" />
      <Label htmlFor="plan-team">Team</Label>
    </div>
  </RadioGroup>
)

export const Disabled = () => (
  <RadioGroup aria-label="Shipping (disabled)">
    <div className="flex items-center gap-2">
      <Radio id="ship-std" name="ship" value="std" disabled defaultChecked />
      <Label htmlFor="ship-std">Standard</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="ship-exp" name="ship" value="exp" disabled />
      <Label htmlFor="ship-exp">Express</Label>
    </div>
  </RadioGroup>
)
