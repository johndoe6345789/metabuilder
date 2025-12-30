// TODO: Split this file (209 LOC) into smaller organisms (<150 LOC each)
'use client'

import { createContext, forwardRef, ReactNode, useContext } from 'react'
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form'

import { Box, FormHelperText, FormLabel } from '@/fakemui'

import styles from './Form.module.scss'

// Form Context
interface FormFieldContextValue {
  name: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

interface FormItemContextValue {
  id: string
}

const FormItemContext = createContext<FormItemContextValue | null>(null)

// Custom hook to use form field
const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const form = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const fieldState = form?.getFieldState(fieldContext.name, form.formState)

  return {
    id: itemContext?.id ?? fieldContext.name,
    name: fieldContext.name,
    formItemId: `${itemContext?.id ?? fieldContext.name}-form-item`,
    formDescriptionId: `${itemContext?.id ?? fieldContext.name}-form-item-description`,
    formMessageId: `${itemContext?.id ?? fieldContext.name}-form-item-message`,
    ...fieldState,
  }
}

// Form component - wraps react-hook-form
const Form = forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ children, ...props }, ref) => {
    return (
      <form ref={ref} {...props}>
        {children}
      </form>
    )
  }
)
Form.displayName = 'Form'

// FormField component
interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  render: ControllerProps<TFieldValues, TName>['render']
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  )
}
FormField.displayName = 'FormField'

// FormItem component
interface FormItemProps {
  children: ReactNode
  className?: string
}

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  ({ children, className = '', ...props }, ref) => {
    const id = `form-item-${Math.random().toString(36).substr(2, 9)}`

    return (
      <FormItemContext.Provider value={{ id }}>
        <Box ref={ref} className={`${styles.formItem} ${className}`} {...props}>
          {children}
        </Box>
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = 'FormItem'

// FormLabel component
interface FormLabelProps {
  children: ReactNode
  className?: string
}

const FormLabelComponent = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className = '', ...props }, ref) => {
    const { error, formItemId } = useFormField()

    return (
      <FormLabel
        ref={ref}
        htmlFor={formItemId}
        className={`${styles.formLabel} ${error ? styles.error : ''} ${className}`}
        {...props}
      >
        {children}
      </FormLabel>
    )
  }
)
FormLabelComponent.displayName = 'FormLabel'

// FormControl wrapper
interface FormControlProps {
  children: ReactNode
  className?: string
}

const FormControlComponent = forwardRef<HTMLDivElement, FormControlProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={className} {...props}>
        {children}
      </Box>
    )
  }
)
FormControlComponent.displayName = 'FormControl'

// FormDescription component
interface FormDescriptionProps {
  children: ReactNode
  className?: string
}

const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <FormHelperText
        ref={ref}
        id={formDescriptionId}
        className={`${styles.formHelperText} ${className}`}
        {...props}
      >
        {children}
      </FormHelperText>
    )
  }
)
FormDescription.displayName = 'FormDescription'

// FormMessage component
interface FormMessageProps {
  children?: ReactNode
  className?: string
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ children, className = '', ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <FormHelperText
        ref={ref}
        id={formMessageId}
        error={!!error}
        className={`${styles.formHelperText} ${error ? styles.error : ''} ${className}`}
        {...props}
      >
        {body}
      </FormHelperText>
    )
  }
)
FormMessage.displayName = 'FormMessage'

export {
  Form,
  FormControlComponent as FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabelComponent as FormLabel,
  FormMessage,
  useFormField,
}
