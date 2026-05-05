'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import { cn } from '../../lib/cn.js'
import { Label } from '../label/index.js'

type FormFieldContextValue = {
  name: string
}
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

type FormItemContextValue = {
  id: string
}
const FormItemContext = React.createContext<FormItemContextValue | null>(null)

export type FormProps<TValues extends FieldValues = FieldValues> = UseFormReturn<TValues> & {
  children?: React.ReactNode
}

export function Form<TValues extends FieldValues = FieldValues>({
  children,
  ...form
}: FormProps<TValues>): React.JSX.Element {
  return <FormProvider {...form}>{children}</FormProvider>
}

export type FormFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
> = ControllerProps<TValues, TName>

export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: FormFieldProps<TValues, TName>): React.JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller<TValues, TName> {...props} />
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField must be used inside <FormField>.')
  }
  if (!itemContext) {
    throw new Error('useFormField must be used inside <FormItem>.')
  }
  if (!formContext) {
    throw new Error('useFormField must be used inside <Form>.')
  }

  const { id } = itemContext
  const fieldState = formContext.getFieldState(fieldContext.name, formContext.formState)

  return {
    id,
    name: fieldContext.name,
    formItemId: id,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    error: fieldState.error,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
  }
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  function FormItem({ className, ...props }, ref) {
    const generatedId = React.useId()
    return (
      <FormItemContext.Provider value={{ id: generatedId }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel({ className, ...props }, ref) {
    const { error, formItemId } = useFormField()
    return (
      <Label
        ref={ref}
        htmlFor={formItemId}
        className={cn(error && 'text-destructive', className)}
        {...props}
      />
    )
  },
)

export type FormControlProps = React.ComponentProps<typeof Slot>

export const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  function FormControl(props, ref) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={
          error
            ? `${formDescriptionId} ${formMessageId}`
            : `${formDescriptionId}`
        }
        aria-invalid={error ? true : undefined}
        {...props}
      />
    )
  },
)

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  function FormDescription({ className, ...props }, ref) {
    const { formDescriptionId } = useFormField()
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  function FormMessage({ className, children, ...props }, ref) {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message ?? '') : children
    if (!body) return null
    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
