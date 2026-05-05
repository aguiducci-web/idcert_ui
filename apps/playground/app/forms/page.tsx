'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Button,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  Slider,
  type MultiSelectOption,
} from '@idcert/ui'

const schema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Almeno 8 caratteri'),
  remember: z.boolean(),
  country: z.string().min(1, 'Obbligatorio'),
  languages: z.array(z.string()).min(1, 'Seleziona almeno una lingua'),
  volume: z.array(z.number()),
})

type Values = z.infer<typeof schema>

const countries = [
  { value: 'it', label: 'Italia' },
  { value: 'fr', label: 'Francia' },
  { value: 'es', label: 'Spagna' },
]

const languages: MultiSelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

export default function FormsPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
      country: '',
      languages: [],
      volume: [50],
    },
  })

  const [submitted, setSubmitted] = React.useState<Values | null>(null)

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-semibold">Forms smoke test</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => setSubmitted(v))}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>Mai condivisa.</FormDescription>
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
                <FormLabel>Ricordami</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paese</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Paese">
                      <SelectValue placeholder="Scegli…" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lingue</FormLabel>
                <FormControl>
                  <MultiSelect
                    items={languages}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleziona…"
                  >
                    <MultiSelectTrigger aria-label="Lingue">
                      <MultiSelectChips />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectEmpty>Nessun risultato</MultiSelectEmpty>
                      <MultiSelectList>
                        {(item) => (
                          <MultiSelectItem value={item.value}>
                            {item.label}
                          </MultiSelectItem>
                        )}
                      </MultiSelectList>
                    </MultiSelectContent>
                  </MultiSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume: {field.value[0]}</FormLabel>
                <FormControl>
                  <Slider
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Volume"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Invia</Button>
        </form>
      </Form>
      {submitted && (
        <pre className="mt-6 rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </main>
  )
}
