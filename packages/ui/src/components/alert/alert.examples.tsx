import { Rocket } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './index.js'

export const Default = () => (
  <Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components to your app using the CLI.
    </AlertDescription>
  </Alert>
)

export const AllVariants = () => (
  <div className="flex flex-col gap-3">
    <Alert variant="default">
      <AlertTitle>Default</AlertTitle>
      <AlertDescription>Neutral message with no urgency.</AlertDescription>
    </Alert>
    <Alert variant="info">
      <AlertTitle>Info</AlertTitle>
      <AlertDescription>Contextual information about the current view.</AlertDescription>
    </Alert>
    <Alert variant="success">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes were saved.</AlertDescription>
    </Alert>
    <Alert variant="warning">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Your trial expires in three days.</AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <AlertTitle>Destructive</AlertTitle>
      <AlertDescription>We could not process your payment.</AlertDescription>
    </Alert>
  </div>
)

export const TitleAndDescription = () => (
  <Alert variant="info">
    <AlertTitle>New version available</AlertTitle>
    <AlertDescription>
      Version 2.4 introduces dark-mode tokens and a redesigned settings panel.
      Reload the app to apply the update.
    </AlertDescription>
  </Alert>
)

export const WithCustomIcon = () => (
  <Alert variant="info" icon={<Rocket aria-hidden="true" />}>
    <AlertTitle>Launching soon</AlertTitle>
    <AlertDescription>
      Replace the variant default icon by passing a custom node to the icon prop.
    </AlertDescription>
  </Alert>
)

export const WithoutIcon = () => (
  <Alert variant="success" icon={false}>
    <AlertTitle>Saved</AlertTitle>
    <AlertDescription>
      Suppress the variant icon when the surrounding layout already communicates
      state and an icon would be redundant.
    </AlertDescription>
  </Alert>
)
