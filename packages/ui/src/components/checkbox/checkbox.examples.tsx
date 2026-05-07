'use client'
import { Checkbox } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
  </div>
)
