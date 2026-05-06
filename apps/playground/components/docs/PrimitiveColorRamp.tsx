'use client'

import * as React from 'react'
import { primitives } from '@idcert/tokens'
import { useToast } from '@idcert/ui'

type Ramp = keyof typeof primitives.color

export function PrimitiveColorRamp({ ramp }: { ramp: Ramp }) {
  const colors = primitives.color[ramp] as Record<string, string>
  const toast = useToast()

  async function copy(hex: string) {
    await navigator.clipboard.writeText(hex)
    toast.add({ title: `Copied ${hex}` })
  }

  return (
    <div className="my-4">
      <h4 className="mb-2 text-sm font-semibold capitalize">{ramp}</h4>
      <div className="grid grid-cols-11 overflow-hidden rounded-md border border-border">
        {Object.entries(colors).map(([step, hex]) => (
          <button
            type="button"
            key={step}
            onClick={() => copy(hex)}
            aria-label={`Copy ${ramp}-${step} ${hex}`}
            className="flex aspect-square flex-col items-center justify-center text-[10px] font-mono transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            style={{ backgroundColor: hex, color: Number(step) >= 500 ? '#fff' : '#000' }}
          >
            <span>{step}</span>
            <span className="opacity-60">{hex}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
