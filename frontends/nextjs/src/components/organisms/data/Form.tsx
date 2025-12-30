'use client'

import {
  Box,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
} from '@/fakemui'
import { forwardRef, ReactNode } from 'react'
import {
  Controller,
  ControllerProps,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  UseFormReturn,
} from 'react-hook-form'

// Form wrapper with react-hook-form
interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  children: ReactNode
  className?: string
}

function Form<T extends FieldValues>({ form, onSubmit, children, className, ...props }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <Box
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={`form-wrapper ${className || ''}`}
        {...props}
      >
        {children}
      </Box>
    </FormProvider>
  )
}
Form.displayName = 'Form'

// FormField (wrapper for Controller)
interface FormFieldProps<T extends FieldValues> extends Omit<ControllerProps<T>, 'render'> {
  render: ControllerProps<T>['render']
}

function FormField<T extends FieldValues>({ name, control, render, ...props }: FormFieldProps<T>) {
  return <Controller name={name} control={control} render={render} {...props} />
}
FormField.displayName = 'FormField'

// FormItem
const FormItem = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`form-item ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
FormItem.displayName = 'FormItem'

// FormLabel
const FormLabelComponent = forwardRef<
  HTMLLabelElement,
  { children: ReactNode; required?: boolean; error?: boolean; className?: string }
>(({ children, required, error, className, ...props }, ref) => {
  return (
    <FormLabel
      ref={ref}
      required={required}
      error={error}
      className={`form-label ${className || ''}`}
      {...props}
    >
      {children}
    </FormLabel>
  )
})
FormLabelComponent.displayName = 'FormLabel'

// FormControl (wrapper)
const FormControlComponent = forwardRef<
  HTMLDivElement,
  { children: ReactNode; fullWidth?: boolean; error?: boolean; className?: string }
>(({ children, fullWidth = true, error, className, ...props }, ref) => {
  return (
    <FormControl ref={ref} fullWidth={fullWidth} error={error} className={className} {...props}>
      {children}
    </FormControl>
  )
})
FormControlComponent.displayName = 'FormControl'

// FormDescription
const FormDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <FormHelperText ref={ref} {...props}>
      {children}
    </FormHelperText>
  )
})
FormDescription.displayName = 'FormDescription'

// FormMessage (error message)
const FormMessage = forwardRef<HTMLParagraphElement, { children?: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    if (!children) return null
    return (
      <FormHelperText ref={ref} error {...props}>
        {children}
      </FormHelperText>
    )
  }
)
FormMessage.displayName = 'FormMessage'

// useFormField hook (to get form context in nested components)
const useFormField = () => {
  const context = useFormContext()
  return context
}

export {
  Form,
  FormControlComponent as FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabelComponent as FormLabel,
  FormMessage,
  FormProvider,
  useForm,
  useFormField,
}
