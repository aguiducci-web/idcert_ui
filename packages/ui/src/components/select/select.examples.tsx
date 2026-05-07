'use client'
import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './index.js'
import { Label } from '../label/index.js'
import { Globe, Mail, Phone, MessageSquare } from 'lucide-react'

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

export const WithLabel = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="country-select">Country</Label>
    <Select>
      <SelectTrigger id="country-select">
        <SelectValue placeholder="Choose a country…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="es">Spain</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const Grouped = () => (
  <div className="w-64">
    <Select>
      <SelectTrigger aria-label="Region">
        <SelectValue placeholder="Choose a region…" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="es">Spain</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Americas</SelectLabel>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="br">Brazil</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)

export const Disabled = () => (
  <div className="w-64">
    <Select>
      <SelectTrigger aria-label="Country" disabled>
        <SelectValue placeholder="Unavailable" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="fr">France</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const WithIcon = () => (
  <div className="w-64">
    <Select>
      <SelectTrigger aria-label="Contact channel">
        <SelectValue placeholder="Choose a channel…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="email">
          <span className="flex items-center gap-2">
            <Mail aria-hidden="true" className="h-4 w-4" />
            Email
          </span>
        </SelectItem>
        <SelectItem value="phone">
          <span className="flex items-center gap-2">
            <Phone aria-hidden="true" className="h-4 w-4" />
            Phone
          </span>
        </SelectItem>
        <SelectItem value="sms">
          <span className="flex items-center gap-2">
            <MessageSquare aria-hidden="true" className="h-4 w-4" />
            SMS
          </span>
        </SelectItem>
        <SelectItem value="web">
          <span className="flex items-center gap-2">
            <Globe aria-hidden="true" className="h-4 w-4" />
            Web push
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const Controlled = () => {
  const [value, setValue] = React.useState<string>('fr')
  return (
    <div className="w-64 space-y-2">
      <Select value={value} onValueChange={(v: string) => setValue(v)}>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose a country…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="es">Spain</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  )
}
