'use client'
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
