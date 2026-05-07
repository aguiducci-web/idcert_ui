import { Skeleton } from './index.js'

export const Default = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
)

export const Card = () => (
  <div className="w-80 space-y-4 rounded-lg border p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
)

export const List = () => (
  <div className="w-80 space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

export const Avatar = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <Skeleton className="h-10 w-10 rounded-full" />
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-16 w-16 rounded-full" />
  </div>
)

export const Paragraph = () => (
  <div className="w-96 space-y-2">
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-11/12" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <Skeleton className="h-3 w-2/3" />
  </div>
)
