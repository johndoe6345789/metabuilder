'use client'

import { ComponentProps, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Material Design 3 Floating Action Button (FAB)
 *
 * Variants:
 * - primary: Primary container color (default)
 * - secondary: Secondary container color
 * - tertiary: Tertiary container color
 * - surface: Surface container color
 *
 * Sizes:
 * - small: 40x40 (MD3 Small FAB)
 * - default: 56x56 (MD3 FAB)
 * - large: 96x96 (MD3 Large FAB)
 */
const fabVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "rounded-2xl font-medium",
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-[0.38]",
    "[&_svg]:pointer-events-none",
    "shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "relative overflow-hidden select-none",
    "shadow-lg hover:shadow-xl active:shadow-md",
    // State layer
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:duration-200",
    "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary container (default)
        primary: [
          "bg-primary text-primary-foreground",
          "focus-visible:ring-primary",
        ].join(" "),

        // Secondary container
        secondary: [
          "bg-secondary text-secondary-foreground",
          "focus-visible:ring-secondary",
        ].join(" "),

        // Tertiary container
        tertiary: [
          "bg-accent text-accent-foreground",
          "focus-visible:ring-accent",
        ].join(" "),

        // Surface container
        surface: [
          "bg-card text-primary",
          "focus-visible:ring-primary",
        ].join(" "),
      },
      size: {
        // MD3 Small FAB - 40x40
        small: "size-10 rounded-xl [&_svg]:size-5",
        // MD3 FAB - 56x56
        default: "size-14 rounded-2xl [&_svg]:size-6",
        // MD3 Large FAB - 96x96
        large: "size-24 rounded-[28px] [&_svg]:size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

interface FABProps
  extends ComponentProps<"button">,
    VariantProps<typeof fabVariants> {
  icon: React.ReactNode
}

const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ className, variant, size, icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="fab"
        data-testid="fab"
        className={cn(fabVariants({ variant, size }), className)}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
FAB.displayName = "FAB"

/**
 * Extended FAB with label
 */
interface ExtendedFABProps
  extends ComponentProps<"button">,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode
  label: string
}

const extendedFabVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-3",
    "h-14 px-4 rounded-2xl font-medium text-sm",
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-[0.38]",
    "[&_svg]:pointer-events-none [&_svg]:size-6",
    "shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "relative overflow-hidden select-none",
    "shadow-lg hover:shadow-xl active:shadow-md",
    // State layer
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:duration-200",
    "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "focus-visible:ring-primary",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "focus-visible:ring-secondary",
        ].join(" "),
        tertiary: [
          "bg-accent text-accent-foreground",
          "focus-visible:ring-accent",
        ].join(" "),
        surface: [
          "bg-card text-primary",
          "focus-visible:ring-primary",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

const ExtendedFAB = forwardRef<HTMLButtonElement, ExtendedFABProps>(
  ({ className, variant, icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="extended-fab"
        data-testid="extended-fab"
        className={cn(extendedFabVariants({ variant }), className)}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </button>
    )
  }
)
ExtendedFAB.displayName = "ExtendedFAB"

export { FAB, ExtendedFAB, fabVariants, extendedFabVariants }
