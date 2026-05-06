import type { DocStatus } from '@/lib/docs'

const labels: Record<DocStatus, { text: string; className: string }> = {
  stable: { text: '', className: '' },
  experimental: {
    text: 'Experimental',
    className: 'bg-yellow-200 text-yellow-900',
  },
  deprecated: {
    text: 'Deprecated',
    className: 'bg-red-200 text-red-900',
  },
  'in-progress': {
    text: 'Documentation in progress',
    className: 'bg-blue-200 text-blue-900',
  },
}

export function StatusBadge({ status }: { status?: DocStatus }) {
  if (!status || status === 'stable') return null
  const { text, className } = labels[status]
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {text}
    </span>
  )
}
