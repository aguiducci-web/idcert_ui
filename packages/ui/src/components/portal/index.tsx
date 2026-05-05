'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

export type PortalProps = {
  children: React.ReactNode
  /**
   * The DOM element to render into. Defaults to `document.body` after
   * the first client-side render. Pass `null` to render nothing.
   */
  container?: Element | null
}

export function Portal({ children, container }: PortalProps): React.ReactPortal | null {
  const [target, setTarget] = React.useState<Element | null>(null)

  React.useEffect(() => {
    if (container === null) {
      setTarget(null)
      return
    }
    setTarget(container ?? document.body)
  }, [container])

  if (!target) return null
  return createPortal(children, target)
}
