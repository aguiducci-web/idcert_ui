import propsData from '@/public/props.json'
import { cn } from '@/lib/cn'

type PropType = { name: string; value?: { value: string }[] }

type PropDoc = {
  name: string
  required: boolean
  description: string
  defaultValue?: { value: string } | null
  type: PropType
}

type ComponentDoc = {
  displayName: string
  description: string
  props: Record<string, PropDoc>
}

const data = propsData as unknown as Record<string, ComponentDoc>

export function PropsTable({ component }: { component: string }) {
  const doc = data[component]
  if (!doc) return null
  const entries = Object.values(doc.props)
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Prop</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Default</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((p) => (
            <tr key={p.name} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <code className="font-mono">{p.name}</code>
                {p.required && (
                  <span className="ml-1 text-destructive" aria-label="required">
                    *
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <TypeCell type={p.type} />
              </td>
              <td className="px-3 py-2 font-mono text-muted-foreground">
                {p.defaultValue?.value ?? '—'}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {p.description || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TypeCell({ type }: { type: PropType }) {
  if (type.name === 'enum' && type.value) {
    return (
      <div className="flex flex-wrap gap-1">
        {type.value.map((v) => (
          <code
            key={v.value}
            className={cn(
              'rounded bg-secondary px-1.5 py-0.5 text-xs',
              'text-secondary-foreground',
            )}
          >
            {v.value}
          </code>
        ))}
      </div>
    )
  }
  return <code className="font-mono">{type.name}</code>
}
