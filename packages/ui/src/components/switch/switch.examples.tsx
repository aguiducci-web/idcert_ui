'use client'
import { Switch } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center gap-2">
    <Switch id="airplane" />
    <Label htmlFor="airplane">Airplane Mode</Label>
  </div>
)
