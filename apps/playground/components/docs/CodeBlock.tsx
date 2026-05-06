'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export function CodeBlock({
  language = 'tsx',
  children,
  className,
}: {
  language?: string
  children: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn('group relative my-4 rounded-md border border-border bg-muted', className)}>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'absolute right-2 top-2 rounded border border-border bg-background px-2 py-1 text-xs',
          'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
        )}
        aria-label="Copy code"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  )
}
