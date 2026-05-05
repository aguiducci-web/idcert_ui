import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from './index.js'
import { Input } from '../input/index.js'

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Required'),
})

type Values = z.infer<typeof schema>

function TestForm({
  onSubmit = () => {},
  defaultValues,
}: {
  onSubmit?: (v: Values) => void
  defaultValues?: Partial<Values>
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', ...defaultValues },
  })
  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>We never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  test('renders FormProvider context (children visible)', () => {
    render(<TestForm />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  test('handleSubmit fires with values when form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Name'), 'Andrea')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'a@b.com', name: 'Andrea' },
        expect.anything(),
      )
    })
  })
})

describe('FormField', () => {
  test('FormItem and FormLabel auto-link via htmlFor / id', () => {
    render(<TestForm />)
    const label = screen.getByText('Email')
    const input = screen.getByLabelText('Email')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  test('FormControl propagates aria-describedby and aria-invalid after invalid submit', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    const input = screen.getByLabelText('Email')
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })

  test('FormMessage shows zod error after invalid submit', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  test('FormDescription rendered with id linked via aria-describedby', () => {
    render(<TestForm />)
    const description = screen.getByText('We never share your email.')
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-describedby')).toContain(description.id)
  })

  test('useFormField throws when used outside FormField', () => {
    function Bad() {
      useFormField()
      return null
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(/useFormField/i)
    spy.mockRestore()
  })

  test('field default value populates input', () => {
    render(<TestForm defaultValues={{ email: 'preset@x.com' }} />)
    expect(screen.getByLabelText('Email')).toHaveValue('preset@x.com')
  })

  test('controlled value via field updates on user input', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    const input = screen.getByLabelText('Email') as HTMLInputElement
    await user.type(input, 'x@y.com')
    expect(input.value).toBe('x@y.com')
  })
})
