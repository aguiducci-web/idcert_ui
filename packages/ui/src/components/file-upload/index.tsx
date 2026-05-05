'use client'

import * as React from 'react'
import { File as FileIcon, X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type FileUploadError =
  | { type: 'size'; file: File; max: number }
  | { type: 'count'; max: number }
  | { type: 'accept'; file: File }

type FileUploadContextValue = {
  value: File[]
  setValue: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple: boolean
  disabled: boolean
  onError?: (error: FileUploadError) => void
  inputRef: React.RefObject<HTMLInputElement>
  urlMap: React.MutableRefObject<Map<File, string>>
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null)

function useFileUpload(): FileUploadContextValue {
  const ctx = React.useContext(FileUploadContext)
  if (!ctx) throw new Error('FileUpload sub-parts must be used inside <FileUpload>.')
  return ctx
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase())
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  return tokens.some((token) => {
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1)
      return fileType.startsWith(prefix)
    }
    if (token.startsWith('.')) {
      return fileName.endsWith(token)
    }
    return fileType === token
  })
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export type FileUploadProps = {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  onError?: (error: FileUploadError) => void
  children?: React.ReactNode
}

export function FileUpload({
  value: valueProp,
  defaultValue,
  onValueChange,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  onError,
  children,
}: FileUploadProps): React.JSX.Element {
  const [uncontrolled, setUncontrolled] = React.useState<File[]>(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const inputRef = React.useRef<HTMLInputElement>(null)
  const urlMap = React.useRef<Map<File, string>>(new Map())

  const setValue = React.useCallback(
    (next: File[]) => {
      // Revoke URLs for removed files.
      const nextSet = new Set(next)
      for (const [file, url] of urlMap.current) {
        if (!nextSet.has(file)) {
          URL.revokeObjectURL(url)
          urlMap.current.delete(file)
        }
      }
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  React.useEffect(() => {
    const map = urlMap.current
    return () => {
      for (const url of map.values()) {
        URL.revokeObjectURL(url)
      }
      map.clear()
    }
  }, [])

  const ctx = React.useMemo<FileUploadContextValue>(
    () => ({
      value,
      setValue,
      accept,
      maxSize,
      maxFiles,
      multiple,
      disabled,
      onError,
      inputRef,
      urlMap,
    }),
    [value, setValue, accept, maxSize, maxFiles, multiple, disabled, onError],
  )

  return <FileUploadContext.Provider value={ctx}>{children}</FileUploadContext.Provider>
}

function processFiles(
  incoming: File[],
  ctx: FileUploadContextValue,
): File[] {
  const { value, accept, maxSize, maxFiles, multiple, onError } = ctx
  const accepted: File[] = []

  for (const file of incoming) {
    if (!matchesAccept(file, accept)) {
      onError?.({ type: 'accept', file })
      continue
    }
    if (maxSize !== undefined && file.size > maxSize) {
      onError?.({ type: 'size', file, max: maxSize })
      continue
    }
    accepted.push(file)
  }

  let merged = multiple ? [...value, ...accepted] : accepted.slice(-1)

  if (maxFiles !== undefined && maxFiles > 0 && merged.length > maxFiles) {
    onError?.({ type: 'count', max: maxFiles })
    merged = merged.slice(0, maxFiles)
  }

  return merged
}

export type FileUploadDropzoneProps = React.HTMLAttributes<HTMLDivElement>

export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone({ className, children, onDragOver, onDrop, onDragEnter, onDragLeave, ...props }, ref) {
    const ctx = useFileUpload()
    const [dragging, setDragging] = React.useState(false)

    return (
      <div
        ref={ref}
        data-fileupload-dropzone=""
        data-dragging={dragging || undefined}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background p-6 text-center text-sm transition-colors',
          'data-[dragging]:border-primary data-[dragging]:bg-accent',
          ctx.disabled && 'pointer-events-none opacity-50',
          className,
        )}
        onDragOver={(e) => {
          e.preventDefault()
          onDragOver?.(e)
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
          onDragEnter?.(e)
        }}
        onDragLeave={(e) => {
          setDragging(false)
          onDragLeave?.(e)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (ctx.disabled) return
          const list = e.dataTransfer?.files
          if (!list) return
          const incoming = Array.from(list)
          const next = processFiles(incoming, ctx)
          ctx.setValue(next)
          onDrop?.(e)
        }}
        {...props}
      >
        {children}
        <input
          ref={ctx.inputRef}
          type="file"
          accept={ctx.accept}
          multiple={ctx.multiple}
          disabled={ctx.disabled}
          className="hidden"
          onChange={(event) => {
            const list = event.target.files
            if (!list) return
            const incoming = Array.from(list)
            const next = processFiles(incoming, ctx)
            ctx.setValue(next)
            event.target.value = ''
          }}
        />
      </div>
    )
  },
)

export type FileUploadPromptProps = React.HTMLAttributes<HTMLParagraphElement>

export const FileUploadPrompt = React.forwardRef<HTMLParagraphElement, FileUploadPromptProps>(
  function FileUploadPrompt({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type FileUploadButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const FileUploadButton = React.forwardRef<HTMLButtonElement, FileUploadButtonProps>(
  function FileUploadButton({ className, onClick, type = 'button', ...props }, ref) {
    const ctx = useFileUpload()
    return (
      <button
        ref={ref}
        type={type}
        disabled={ctx.disabled}
        className={cn(
          'inline-flex items-center underline underline-offset-2 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        onClick={(e) => {
          ctx.inputRef.current?.click()
          onClick?.(e)
        }}
        {...props}
      />
    )
  },
)

export type FileUploadListProps = React.HTMLAttributes<HTMLUListElement>

export const FileUploadList = React.forwardRef<HTMLUListElement, FileUploadListProps>(
  function FileUploadList({ className, ...props }, ref) {
    const ctx = useFileUpload()
    if (ctx.value.length === 0) return null
    return (
      <ul ref={ref} className={cn('mt-2 space-y-1', className)} {...props}>
        {ctx.value.map((file) => (
          <FileUploadItem key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />
        ))}
      </ul>
    )
  },
)

export type FileUploadItemProps = {
  file: File
  className?: string
}

export function FileUploadItem({ file, className }: FileUploadItemProps): React.JSX.Element {
  const ctx = useFileUpload()
  const isImage = file.type.startsWith('image/')

  const previewUrl = React.useMemo(() => {
    if (!isImage) return undefined
    let url = ctx.urlMap.current.get(file)
    if (!url) {
      url = URL.createObjectURL(file)
      ctx.urlMap.current.set(file, url)
    }
    return url
  }, [file, isImage, ctx.urlMap])

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-background p-2 text-sm',
        className,
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <FileIcon aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        )}
      </span>
      <span className="flex-1 truncate">
        <span className="block truncate font-medium">{file.name}</span>
        <span className="block text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      </span>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={ctx.disabled}
        onClick={() => ctx.setValue(ctx.value.filter((f) => f !== file))}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </li>
  )
}
