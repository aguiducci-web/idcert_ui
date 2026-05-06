'use client'

import * as React from 'react'

type Scope = 'color' | 'radius' | 'spacing'

const SCOPES: Record<Scope, { label: string; tokens: string[] }> = {
  color: {
    label: 'Color',
    tokens: [
      '--background', '--foreground',
      '--card', '--card-foreground',
      '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground',
      '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring',
    ],
  },
  radius: {
    label: 'Radius',
    tokens: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'],
  },
  spacing: {
    label: 'Spacing',
    tokens: ['--spacing-1', '--spacing-2', '--spacing-3', '--spacing-4', '--spacing-6', '--spacing-8'],
  },
}

export function TokenGrid({ scope }: { scope: Scope }) {
  const { tokens } = SCOPES[scope]
  const [resolved, setResolved] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const map: Record<string, string> = {}
    const styles = getComputedStyle(document.documentElement)
    for (const token of tokens) {
      map[token] = styles.getPropertyValue(token).trim()
    }
    setResolved(map)
  }, [tokens])

  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token}
          className="flex items-center gap-3 rounded-md border border-border p-3"
        >
          <Swatch scope={scope} value={resolved[token]} />
          <div className="min-w-0 flex-1">
            <code className="block truncate font-mono text-sm">{token}</code>
            <span className="text-xs text-muted-foreground">
              {resolved[token] || '…'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Swatch({ scope, value }: { scope: Scope; value?: string }) {
  if (scope === 'color') {
    return (
      <span
        aria-hidden
        className="h-10 w-10 shrink-0 rounded border border-border"
        style={{ backgroundColor: value ? `rgb(${value})` : undefined }}
      />
    )
  }
  if (scope === 'radius') {
    return (
      <span
        aria-hidden
        className="h-10 w-10 shrink-0 border border-border bg-muted"
        style={{ borderRadius: value || undefined }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="h-10 shrink-0 bg-muted"
      style={{ width: value || '0.25rem' }}
    />
  )
}
