import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends ComponentProps<"div"> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClass = {
      default: "mat-badge",
      secondary: "mat-badge mat-accent",
      destructive: "mat-badge mat-warn",
      outline: "mat-badge",
    }[variant]

    return (
      <div
        ref={ref}
        className={cn(variantClass, className)}
        data-testid="badge"
        role="status"
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
