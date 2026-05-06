'use client'

import * as React from 'react'

export function TokenList({
  component,
  tokens,
}: {
  component?: string
  tokens: string[]
}) {
  const [resolved, setResolved] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const map: Record<string, string> = {}
    for (const token of tokens) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        token,
      )
      map[token] = value.trim()
    }
    setResolved(map)
  }, [tokens])

  return (
    <ul className="my-4 list-none space-y-1 rounded-md border border-border p-3">
      {tokens.map((token) => (
        <li key={token} className="flex items-center gap-3 font-mono text-sm">
          <span
            aria-hidden
            style={{
              backgroundColor: token.startsWith('--color')
                ? `rgb(${resolved[token] || '128 128 128'})`
                : 'transparent',
            }}
            className="h-4 w-4 rounded border border-border"
          />
          <code>{token}</code>
          <span className="text-muted-foreground">
            {resolved[token] || '…'}
          </span>
          {component && (
            <span className="ml-auto text-xs text-muted-foreground">
              {component}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
