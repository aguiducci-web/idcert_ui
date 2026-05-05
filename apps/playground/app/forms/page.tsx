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
  DatePicker,
  DateRangePicker,
  TimePicker,
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type MultiSelectOption,
  type DateRange,
} from '@idcert/ui'
import { it as itLocale } from 'date-fns/locale'

const schema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Almeno 8 caratteri'),
  remember: z.boolean(),
  country: z.string().min(1, 'Obbligatorio'),
  languages: z.array(z.string()).min(1, 'Seleziona almeno una lingua'),
  volume: z.array(z.number()),
  birthday: z.date({ required_error: 'Obbligatorio' }).optional(),
  trip: z
    .object({
      from: z.date(),
      to: z.date().optional(),
    })
    .optional(),
  startTime: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
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
      birthday: undefined,
      trip: undefined,
      startTime: '',
      attachments: [],
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger aria-label="Paese">
                      <SelectValue placeholder="Scegli…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <MultiSelect
                  items={languages}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleziona…"
                >
                  <FormControl>
                    <MultiSelectTrigger aria-label="Lingue">
                      <MultiSelectChips />
                    </MultiSelectTrigger>
                  </FormControl>
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
          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di nascita</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value as Date | undefined}
                    onValueChange={field.onChange}
                    locale={itLocale}
                    format="dd/MM/yyyy"
                    aria-label="Data di nascita"
                    placeholder="Scegli…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodo viaggio</FormLabel>
                <FormControl>
                  <DateRangePicker
                    value={field.value as DateRange | undefined}
                    onValueChange={field.onChange}
                    locale={itLocale}
                    format="dd/MM/yyyy"
                    aria-label="Periodo viaggio"
                    placeholder="Scegli range…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orario inizio</FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Orario inizio"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allegati</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value as File[]}
                    onValueChange={field.onChange}
                    accept="image/*,.pdf"
                    maxSize={2 * 1024 * 1024}
                    maxFiles={3}
                    multiple
                  >
                    <FileUploadDropzone>
                      <FileUploadPrompt>
                        Trascina file (immagini o PDF, max 2MB) o{' '}
                        <FileUploadButton>scegli</FileUploadButton>
                      </FileUploadPrompt>
                    </FileUploadDropzone>
                    <FileUploadList />
                  </FileUpload>
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
