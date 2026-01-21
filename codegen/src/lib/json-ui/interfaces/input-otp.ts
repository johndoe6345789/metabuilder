import { ComponentProps } from 'react'

export interface InputOTPProps extends ComponentProps<'div'> {
  containerClassName?: string
  className?: string
}

export interface InputOTPGroupProps extends ComponentProps<'div'> {
  className?: string
}

export interface InputOTPSlotProps extends ComponentProps<'div'> {
  index: number
  className?: string
}

export interface InputOTPSeparatorProps extends ComponentProps<'div'> {}
