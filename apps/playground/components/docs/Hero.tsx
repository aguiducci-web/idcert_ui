import { cn } from '@/lib/cn'

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'my-6 flex min-h-[200px] items-center justify-center rounded-md border border-border bg-card p-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
