'use client'
import { Textarea } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="w-80">
    <Textarea placeholder="Type your message…" />
  </div>
)

export const WithLabel = () => (
  <div className="grid w-80 gap-2">
    <Label htmlFor="message">Message</Label>
    <Textarea id="message" placeholder="Type your message…" />
  </div>
)

export const WithDescription = () => (
  <div className="grid w-80 gap-1.5">
    <Label htmlFor="bio">Bio</Label>
    <Textarea id="bio" aria-describedby="bio-help" rows={4} />
    <p id="bio-help" className="text-xs text-muted-foreground">
      A short description shown on your public profile.
    </p>
  </div>
)

export const ErrorState = () => (
  <div className="grid w-80 gap-1.5">
    <Label htmlFor="reason">Reason</Label>
    <Textarea
      id="reason"
      aria-invalid
      aria-describedby="reason-error"
      defaultValue=""
      className="border-destructive focus-visible:ring-destructive"
    />
    <p id="reason-error" role="alert" className="text-xs text-destructive">
      Please provide a reason.
    </p>
  </div>
)

export const Disabled = () => (
  <div className="w-80">
    <Textarea placeholder="Disabled" disabled />
  </div>
)
