'use client'

import { ComponentProps, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Material Design 3 Top App Bar
 *
 * Variants:
 * - center-aligned: Logo/title centered (default)
 * - small: Standard top app bar
 * - medium: Medium with larger title
 * - large: Large with prominent title
 */

const topAppBarVariants = cva(
  // Base styles
  [
    "w-full",
    "bg-[hsl(var(--card))]",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        "center-aligned": "h-16",
        small: "h-16",
        medium: "h-28",
        large: "h-36",
      },
      scrolled: {
        true: "shadow-md bg-[hsl(var(--card))]/95 backdrop-blur-sm",
        false: "shadow-none",
      },
    },
    defaultVariants: {
      variant: "small",
      scrolled: false,
    },
  }
)

interface TopAppBarProps
  extends ComponentProps<"header">,
    VariantProps<typeof topAppBarVariants> {
  navigationIcon?: React.ReactNode
  onNavigationClick?: () => void
  title?: string
  actions?: React.ReactNode
}

const TopAppBar = forwardRef<HTMLElement, TopAppBarProps>(
  (
    {
      className,
      variant,
      scrolled,
      navigationIcon,
      onNavigationClick,
      title,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const isCenterAligned = variant === "center-aligned"
    const isMediumOrLarge = variant === "medium" || variant === "large"

    return (
      <header
        ref={ref}
        data-slot="top-app-bar"
        data-testid="top-app-bar"
        role="banner"
        className={cn(topAppBarVariants({ variant, scrolled }), className)}
        {...props}
      >
        <div
          className={cn(
            "flex items-center h-16 px-1",
            isCenterAligned && "justify-between"
          )}
        >
          {/* Leading navigation icon */}
          {navigationIcon && (
            <button
              type="button"
              onClick={onNavigationClick}
              className={cn(
                "flex items-center justify-center",
                "size-12 rounded-full",
                "text-foreground",
                "hover:bg-foreground/[0.08]",
                "focus-visible:bg-foreground/[0.12]",
                "active:bg-foreground/[0.12]",
                "transition-colors duration-200",
                "outline-none"
              )}
            >
              {navigationIcon}
            </button>
          )}

          {/* Title - for small and center-aligned */}
          {!isMediumOrLarge && title && (
            <h1
              className={cn(
                "text-lg font-normal text-foreground",
                "truncate",
                isCenterAligned
                  ? "absolute left-1/2 -translate-x-1/2"
                  : "ml-2 flex-1"
              )}
            >
              {title}
            </h1>
          )}

          {/* Trailing actions */}
          {actions && (
            <div className={cn("flex items-center gap-1", !isCenterAligned && "ml-auto")}>
              {actions}
            </div>
          )}
        </div>

        {/* Title for medium and large variants */}
        {isMediumOrLarge && title && (
          <div className="px-4 pb-4">
            <h1
              className={cn(
                "text-foreground font-normal",
                variant === "medium" && "text-2xl",
                variant === "large" && "text-3xl"
              )}
            >
              {title}
            </h1>
          </div>
        )}

        {children}
      </header>
    )
  }
)
TopAppBar.displayName = "TopAppBar"

/**
 * Top App Bar Action Button
 */
interface TopAppBarActionProps extends ComponentProps<"button"> {
  icon: React.ReactNode
}

const TopAppBarAction = forwardRef<HTMLButtonElement, TopAppBarActionProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-slot="top-app-bar-action"
        data-testid="top-app-bar-action"
        className={cn(
          "flex items-center justify-center",
          "size-12 rounded-full",
          "text-foreground",
          "hover:bg-foreground/[0.08]",
          "focus-visible:bg-foreground/[0.12]",
          "active:bg-foreground/[0.12]",
          "transition-colors duration-200",
          "outline-none",
          "[&_svg]:size-6",
          className
        )}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
TopAppBarAction.displayName = "TopAppBarAction"

export { TopAppBar, TopAppBarAction, topAppBarVariants }
