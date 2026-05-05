import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type FileUploadError,
} from './index.js'

function renderUpload(props?: {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  onError?: (e: FileUploadError) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
}) {
  return render(
    <FileUpload {...props}>
      <FileUploadDropzone>
        <FileUploadPrompt>
          Drop files or <FileUploadButton>browse</FileUploadButton>
        </FileUploadPrompt>
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>,
  )
}

function makeFile(name: string, size: number, type: string): File {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('FileUpload', () => {
  test('renders dropzone and button', () => {
    renderUpload()
    expect(screen.getByText(/drop files/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument()
  })

  test('clicking the button triggers the hidden file input', async () => {
    const user = userEvent.setup()
    renderUpload()
    const button = screen.getByRole('button', { name: /browse/i })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    const clickSpy = vi.spyOn(input!, 'click')
    await user.click(button)
    expect(clickSpy).toHaveBeenCalled()
  })

  test('selecting a file via the input fires onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderUpload({ onValueChange: onChange, multiple: true })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = makeFile('a.png', 100, 'image/png')
    await user.upload(input, file)
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg).toHaveLength(1)
    expect(lastArg[0]?.name).toBe('a.png')
  })

  test('drop event on the dropzone fires onValueChange with multiple files', () => {
    const onChange = vi.fn()
    renderUpload({ onValueChange: onChange, multiple: true })
    const dropzone = screen.getByText(/drop files/i).closest('[data-fileupload-dropzone]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    const f2 = makeFile('b.pdf', 200, 'application/pdf')
    const event = new Event('drop', { bubbles: true, cancelable: true }) as Event & {
      dataTransfer: DataTransfer
    }
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [f1, f2] as unknown as FileList },
    })
    act(() => {
      dropzone.dispatchEvent(event)
    })
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg.map((f) => f.name)).toEqual(['a.png', 'b.pdf'])
  })

  test('maxFiles enforces the limit and fires count error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onError = vi.fn()
    renderUpload({
      onValueChange: onChange,
      onError,
      multiple: true,
      maxFiles: 1,
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    const f2 = makeFile('b.png', 100, 'image/png')
    await user.upload(input, [f1, f2])
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg).toHaveLength(1)
    expect(onError).toHaveBeenCalledWith({ type: 'count', max: 1 })
  })

  test('maxSize rejects oversize file and fires size error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onError = vi.fn()
    renderUpload({
      onValueChange: onChange,
      onError,
      multiple: true,
      maxSize: 50,
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    await user.upload(input, f1)
    expect(onError).toHaveBeenCalledWith({
      type: 'size',
      file: expect.objectContaining({ name: 'a.png' }),
      max: 50,
    })
  })

  test('accept rejects mismatched type and fires accept error', async () => {
    // Disable user-event's own accept-attribute filtering so the file reaches
    // our onChange handler and our internal `matchesAccept` logic runs.
    const user = userEvent.setup({ applyAccept: false })
    const onError = vi.fn()
    renderUpload({
      onError,
      multiple: true,
      accept: 'image/*',
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const pdf = makeFile('doc.pdf', 100, 'application/pdf')
    await user.upload(input, pdf)
    expect(onError).toHaveBeenCalledWith({
      type: 'accept',
      file: expect.objectContaining({ name: 'doc.pdf' }),
    })
  })

  test('FileUploadList renders item with name and size', () => {
    const f = makeFile('hello.txt', 1024, 'text/plain')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByText('hello.txt')).toBeInTheDocument()
    expect(screen.getByText(/1\.0\s*KB/i)).toBeInTheDocument()
  })

  test('clicking the remove button removes the file and revokes the object URL', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const f = makeFile('a.png', 100, 'image/png')
    renderUpload({ value: [f], onValueChange: onChange, multiple: true })
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    const removeBtn = screen.getByRole('button', { name: /remove a\.png/i })
    await user.click(removeBtn)
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(revokeSpy).toHaveBeenCalled()
  })

  test('image file gets an <img> preview', () => {
    const f = makeFile('a.png', 100, 'image/png')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByAltText(/a\.png/)).toBeInTheDocument()
  })

  test('non-image file gets an icon (no <img> with that alt)', () => {
    const f = makeFile('doc.pdf', 100, 'application/pdf')
    renderUpload({ value: [f], multiple: true })
    expect(screen.queryByAltText(/doc\.pdf/)).not.toBeInTheDocument()
    const item = screen.getByText('doc.pdf').closest('li')!
    expect(item.querySelector('svg')).not.toBeNull()
  })

  test('controlled mode reflects passed files', () => {
    const f = makeFile('controlled.png', 100, 'image/png')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByText('controlled.png')).toBeInTheDocument()
  })
})
