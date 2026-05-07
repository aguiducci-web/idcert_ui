'use client'
import * as React from 'react'
import { Switch } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center gap-2">
    <Switch id="airplane" />
    <Label htmlFor="airplane">Airplane Mode</Label>
  </div>
)

export const WithLabel = () => (
  <div className="flex items-center gap-2">
    <Switch id="notifications" defaultChecked />
    <Label htmlFor="notifications">Email notifications</Label>
  </div>
)

export const Disabled = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Switch id="off-disabled" disabled />
      <Label htmlFor="off-disabled">Disabled (off)</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="on-disabled" disabled defaultChecked />
      <Label htmlFor="on-disabled">Disabled (on)</Label>
    </div>
  </div>
)

export const Controlled = () => {
  const [checked, setChecked] = React.useState(false)
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="controlled"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <Label htmlFor="controlled">{checked ? 'On' : 'Off'}</Label>
    </div>
  )
}

export const InSettings = () => (
  <div className="flex w-72 flex-col divide-y rounded-md border">
    <div className="flex items-center justify-between p-3">
      <div className="flex flex-col">
        <Label htmlFor="set-wifi">Wi-Fi</Label>
        <span className="text-muted-foreground text-xs">Connect to nearby networks</span>
      </div>
      <Switch id="set-wifi" defaultChecked />
    </div>
    <div className="flex items-center justify-between p-3">
      <div className="flex flex-col">
        <Label htmlFor="set-bt">Bluetooth</Label>
        <span className="text-muted-foreground text-xs">Pair with accessories</span>
      </div>
      <Switch id="set-bt" />
    </div>
    <div className="flex items-center justify-between p-3">
      <div className="flex flex-col">
        <Label htmlFor="set-airplane">Airplane mode</Label>
        <span className="text-muted-foreground text-xs">Disable all wireless</span>
      </div>
      <Switch id="set-airplane" />
    </div>
  </div>
)
