import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = (props?: { variant?: string; size?: string }) => {
  const variant = props?.variant || "filled"
  const variantClass = {
    filled: "mat-mdc-unelevated-button",
    outlined: "mat-mdc-outlined-button",
    outline: "mat-mdc-outlined-button",
    text: "mat-mdc-button",
    elevated: "mat-mdc-raised-button",
    tonal: "mat-tonal-button",
    secondary: "mat-mdc-button",
    destructive: "mat-mdc-unelevated-button",
    ghost: "mat-mdc-button",
    link: "mat-mdc-button",
  }[variant] || "mat-mdc-button"
  return variantClass
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "filled" | "outlined" | "outline" | "text" | "elevated" | "tonal" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", children, asChild, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"

    const variantClass = {
      filled: "mat-mdc-unelevated-button",
      outlined: "mat-mdc-outlined-button",
      outline: "mat-mdc-outlined-button",
      text: "mat-mdc-button",
      elevated: "mat-mdc-raised-button",
      tonal: "mat-tonal-button",
      secondary: "mat-mdc-button",
      destructive: "mat-mdc-unelevated-button",
      ghost: "mat-mdc-button",
      link: "mat-mdc-button",
    }[variant]

    return (
      <Comp
        ref={asChild ? undefined : ref}
        className={cn(variantClass, className)}
        data-testid="button"
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }
