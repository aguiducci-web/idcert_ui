'use client'
import { Checkbox } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
  </div>
)

export const WithLabel = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center space-x-2">
      <Checkbox id="newsletter" defaultChecked />
      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="updates" />
      <Label htmlFor="updates">Send me product updates</Label>
    </div>
  </div>
)

export const DefaultChecked = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="remember" defaultChecked />
    <Label htmlFor="remember">Remember me on this device</Label>
  </div>
)

export const Disabled = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-unchecked" disabled />
      <Label htmlFor="disabled-unchecked">Unavailable option</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label htmlFor="disabled-checked">Locked preference</Label>
    </div>
  </div>
)

export const Group = () => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-2 text-sm font-medium">Permissions</legend>
    <div className="flex items-center space-x-2">
      <Checkbox id="perm-read" name="permissions" value="read" defaultChecked />
      <Label htmlFor="perm-read">Read</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="perm-write" name="permissions" value="write" />
      <Label htmlFor="perm-write">Write</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="perm-delete" name="permissions" value="delete" />
      <Label htmlFor="perm-delete">Delete</Label>
    </div>
  </fieldset>
)
