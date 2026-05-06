'use client'

import * as React from 'react'
import examplesSource from '@/public/examples-source.json'
import { CodeBlock } from './CodeBlock'

const sources = examplesSource as unknown as Record<string, Record<string, string>>

export function Example({
  name,
  component,
  children,
}: {
  name: string
  component: string
  children: React.ReactNode
}) {
  const [showCode, setShowCode] = React.useState(false)
  const source = sources[component]?.[name] ?? ''

  return (
    <div className="my-6 overflow-hidden rounded-md border border-border">
      <div
        className="bg-background p-6"
        style={{
          backgroundImage:
            'linear-gradient(45deg, var(--muted) 25%, transparent 25%, transparent 75%, var(--muted) 75%), linear-gradient(45deg, var(--muted) 25%, transparent 25%, transparent 75%, var(--muted) 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3 rounded bg-card p-6">
          {children}
        </div>
      </div>
      <div className="border-t border-border bg-muted px-3 py-1.5">
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-expanded={showCode}
        >
          {showCode ? 'Hide code' : 'Show code'}
        </button>
      </div>
      {showCode && source && (
        <CodeBlock language="tsx" className="m-0 rounded-none border-0">
          {source}
        </CodeBlock>
      )}
    </div>
  )
}
