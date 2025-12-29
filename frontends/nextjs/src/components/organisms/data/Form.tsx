'use client'

import { forwardRef, ReactNode, ElementType } from 'react'
import {
  Box,
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  FormGroup,
} from '@mui/material'
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form'

// Form wrapper with react-hook-form
interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  children: ReactNode
  className?: string
}

function Form<T extends FieldValues>({ form, onSubmit, children, ...props }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <Box
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }} {...props}>
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
>(({ children, required, error, ...props }, ref) => {
  return (
    <FormLabel
      ref={ref}
      required={required}
      error={error}
      sx={{ fontWeight: 500, fontSize: '0.875rem' }}
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
>(({ children, fullWidth = true, error, ...props }, ref) => {
  return (
    <FormControl ref={ref} fullWidth={fullWidth} error={error} {...props}>
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
  FormField,
  FormItem,
  FormLabelComponent as FormLabel,
  FormControlComponent as FormControl,
  FormDescription,
  FormMessage,
  useFormField,
  useForm,
  FormProvider,
}
