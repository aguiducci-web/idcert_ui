'use client'
import * as React from 'react'
import { Trash } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <AlertDialog>
    <AlertDialogTrigger render={<Button variant="destructive">Delete account</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const Destructive = () => (
  <AlertDialog>
    <AlertDialogTrigger
      render={
        <Button variant="destructive">
          <Trash />
          Delete project
        </Button>
      }
    />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>
          The project and all of its certificates will be permanently removed.
          This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep project</AlertDialogCancel>
        <AlertDialogAction>Delete project</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const Controlled = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Sign out everywhere
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              Active sessions on every browser and mobile device will end. You
              will need to sign in again on each one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <AlertDialogAction>Sign out everywhere</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const WithDescription = () => (
  <AlertDialog>
    <AlertDialogTrigger render={<Button variant="destructive">Revoke certificate</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Revoke this certificate?</AlertDialogTitle>
        <AlertDialogDescription>
          Revoking publishes a CRL entry within five minutes. Clients that have
          cached the certificate will continue to trust it until their cache
          expires.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <p className="text-sm text-muted-foreground">
        If the private key is compromised, also rotate any API tokens issued
        against this identity. Revocation alone does not invalidate tokens.
      </p>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Revoke certificate</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const LongContent = () => (
  <AlertDialog>
    <AlertDialogTrigger render={<Button variant="destructive">Read terms and continue</Button>} />
    <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
      <AlertDialogHeader>
        <AlertDialogTitle>Confirm data export</AlertDialogTitle>
        <AlertDialogDescription>
          Review the full export terms before continuing. The dialog scrolls
          when content overflows the viewport height.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-3 text-sm text-muted-foreground">
        {Array.from({ length: 8 }).map((_, i) => (
          <p key={i}>
            Section {i + 1}. Exporting account data produces a tarball
            containing every certificate, every audit-log entry, and every
            signed artifact attributed to this organization. The archive is
            generated server-side and emailed as a one-time download link
            valid for 24 hours. Once downloaded, the link expires.
          </p>
        ))}
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>I accept, export data</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
