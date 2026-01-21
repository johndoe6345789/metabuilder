import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Card = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-card", "mat-mdc-card-outlined", className)} data-testid="card" role="article" {...props} />
  )
)
Card.displayName = "Card"

export const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-card-header", className)} data-testid="card-header" {...props} />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("mat-mdc-card-title", className)} data-testid="card-title" {...props} />
  )
)
CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("mat-mdc-card-subtitle", className)} data-testid="card-description" {...props} />
  )
)
CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-card-content", className)} data-testid="card-content" {...props} />
  )
)
CardContent.displayName = "CardContent"

export const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-card-actions", className)} data-testid="card-footer" {...props} />
  )
)
CardFooter.displayName = "CardFooter"
