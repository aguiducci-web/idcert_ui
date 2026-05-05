import type { Meta, StoryObj } from '@storybook/react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './index.js'
import { Input } from '../input/index.js'
import { Button } from '../button/index.js'
import { Switch } from '../switch/index.js'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
})

type Values = z.infer<typeof schema>

function LoginFormDemo() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  })
  const [submitted, setSubmitted] = React.useState<Values | null>(null)
  return (
    <div className="mx-auto max-w-md">
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((v) => setSubmitted(v))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormDescription>We never share your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
          <Button type="submit">Sign in</Button>
        </form>
      </Form>
      {submitted && (
        <pre className="mt-4 rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  )
}

const meta: Meta<typeof LoginFormDemo> = {
  title: 'Form/Form',
  component: LoginFormDemo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LoginFormDemo>

export const LoginForm: Story = {
  render: () => <LoginFormDemo />,
}
