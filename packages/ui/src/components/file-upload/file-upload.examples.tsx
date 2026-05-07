'use client'
import * as React from 'react'
import { Upload, X, FileText } from 'lucide-react'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
} from './index.js'

export const Default = () => (
  <div className="mx-auto max-w-md">
    <FileUpload multiple>
      <FileUploadDropzone>
        <FileUploadPrompt>
          Drop files or <FileUploadButton>browse</FileUploadButton>
        </FileUploadPrompt>
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>
  </div>
)

export const Multiple = () => {
  const [files, setFiles] = React.useState<File[]>([])
  return (
    <div className="mx-auto max-w-md">
      <FileUpload multiple value={files} onValueChange={setFiles} maxFiles={5}>
        <FileUploadDropzone>
          <Upload aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
          <FileUploadPrompt>
            Drop up to 5 files or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  )
}

export const Restricted = () => {
  const [files, setFiles] = React.useState<File[]>([])
  return (
    <div className="mx-auto max-w-md">
      <FileUpload
        multiple
        value={files}
        onValueChange={setFiles}
        accept="image/*"
        maxSize={2 * 1024 * 1024}
      >
        <FileUploadDropzone>
          <Upload aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
          <FileUploadPrompt>
            Drop images (max 2 MB) or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  )
}

export const WithList = () => {
  const [files, setFiles] = React.useState<File[]>([
    new File(['stub'], 'invoice-2026-Q1.pdf', { type: 'application/pdf' }),
    new File(['stub'], 'logo.png', { type: 'image/png' }),
  ])
  return (
    <div className="mx-auto max-w-md">
      <FileUpload multiple value={files} onValueChange={setFiles}>
        <FileUploadDropzone>
          <FileText aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
          <FileUploadPrompt>
            Attach more or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
      {files.length > 0 ? (
        <button
          type="button"
          onClick={() => setFiles([])}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" className="h-3 w-3" /> Clear all
        </button>
      ) : null}
    </div>
  )
}

export const Disabled = () => (
  <div className="mx-auto max-w-md">
    <FileUpload multiple disabled>
      <FileUploadDropzone>
        <Upload aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        <FileUploadPrompt>
          Drop files or <FileUploadButton>browse</FileUploadButton>
        </FileUploadPrompt>
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>
  </div>
)
