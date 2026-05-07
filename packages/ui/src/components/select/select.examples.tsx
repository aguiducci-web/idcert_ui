'use client'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './index.js'

export const Default = () => (
  <div className="w-64">
    <Select>
      <SelectTrigger aria-label="Country">
        <SelectValue placeholder="Choose a country…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="es">Spain</SelectItem>
      </SelectContent>
    </Select>
  </div>
)
