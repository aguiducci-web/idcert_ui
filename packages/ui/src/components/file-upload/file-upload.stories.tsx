import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type FileUploadError,
} from './index.js'

const meta = {
  title: 'Form/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)
  return (
    <div className="mx-auto max-w-md space-y-2">
      <FileUpload
        value={files}
        onValueChange={(next) => {
          setFiles(next)
          setError(null)
        }}
        onError={(e: FileUploadError) => {
          if (e.type === 'size') setError(`${e.file.name} exceeds ${e.max} bytes.`)
          else if (e.type === 'count') setError(`Max ${e.max} files.`)
          else if (e.type === 'accept') setError(`${e.file.name} is the wrong type.`)
        }}
        accept="image/*,.pdf"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        multiple
      >
        <FileUploadDropzone>
          <FileUploadPrompt>
            Drop files (image or PDF, max 2MB) or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => (
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
  ),
}

export const ControlledWithValidation: Story = {
  render: () => <ControlledDemo />,
}

export const SingleFile: Story = {
  render: () => (
    <div className="mx-auto max-w-md">
      <FileUpload multiple={false}>
        <FileUploadDropzone>
          <FileUploadPrompt>
            Drop a single file or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="mx-auto max-w-md">
      <FileUpload disabled multiple>
        <FileUploadDropzone>
          <FileUploadPrompt>
            Disabled — no interactions
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
}
