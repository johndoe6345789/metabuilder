import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn("mat-mdc-input-element", "mdc-text-field__input", className)}
      data-testid="input"
      {...props}
    />
  )
)
Input.displayName = "Input"
