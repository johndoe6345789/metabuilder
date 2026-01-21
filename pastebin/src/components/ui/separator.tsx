import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends ComponentProps<"hr"> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(
        "mat-divider",
        orientation === "vertical" && "mat-divider-vertical",
        className
      )}
      aria-orientation={orientation}
      role={decorative ? "none" : "separator"}
      data-testid="separator"
      {...props}
    />
  )
)
Separator.displayName = "Separator"
