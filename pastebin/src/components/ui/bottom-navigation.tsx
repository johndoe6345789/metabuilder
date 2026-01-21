'use client'

import { ComponentProps, createContext, forwardRef, useContext } from "react"
import { cn } from "@/lib/utils"

/**
 * Material Design 3 Bottom Navigation Bar
 *
 * Android-style bottom navigation with:
 * - 3-5 destinations
 * - Active indicator pill
 * - Icon + label layout
 * - Badge support
 */

interface BottomNavigationContextValue {
  activeValue?: string
  onValueChange?: (value: string) => void
}

const BottomNavigationContext = createContext<BottomNavigationContextValue>({})

interface BottomNavigationProps extends ComponentProps<"nav"> {
  value?: string
  onValueChange?: (value: string) => void
}

const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <BottomNavigationContext.Provider value={{ activeValue: value, onValueChange }}>
        <nav
          ref={ref}
          data-slot="bottom-navigation"
          data-testid="bottom-navigation"
          className={cn(
            // Container styles
            "fixed bottom-0 left-0 right-0 z-50",
            "h-20 px-2",
            "bg-[hsl(var(--card))]",
            "border-t border-border/50",
            "shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
            // Flex layout
            "flex items-center justify-around",
            // Safe area for notched phones
            "pb-safe",
            className
          )}
          role="navigation"
          aria-label="Bottom navigation"
          {...props}
        >
          {children}
        </nav>
      </BottomNavigationContext.Provider>
    )
  }
)
BottomNavigation.displayName = "BottomNavigation"

interface BottomNavigationItemProps extends ComponentProps<"button"> {
  value: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  label: string
  badge?: number | boolean
}

const BottomNavigationItem = forwardRef<HTMLButtonElement, BottomNavigationItemProps>(
  ({ className, value, icon, activeIcon, label, badge, ...props }, ref) => {
    const context = useContext(BottomNavigationContext)
    const isActive = context.activeValue === value

    const handleClick = () => {
      context.onValueChange?.(value)
    }

    return (
      <button
        ref={ref}
        data-slot="bottom-navigation-item"
        data-testid={`bottom-navigation-item-${value}`}
        data-active={isActive}
        className={cn(
          // Container
          "relative flex flex-col items-center justify-center",
          "min-w-[64px] h-full px-3 py-2",
          "bg-transparent border-0 cursor-pointer",
          "transition-all duration-200",
          "outline-none",
          // Focus state
          "focus-visible:outline-none",
          className
        )}
        onClick={handleClick}
        aria-selected={isActive}
        aria-label={label}
        {...props}
      >
        {/* Active indicator pill */}
        <span
          className={cn(
            "absolute top-2 w-16 h-8 rounded-full",
            "bg-primary/20",
            "transform transition-all duration-200",
            isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
          aria-hidden="true"
        />

        {/* Icon container */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center",
            "w-6 h-6 mb-1",
            "[&_svg]:size-6",
            "transition-colors duration-200",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
          aria-hidden="true"
        >
          {isActive && activeIcon ? activeIcon : icon}

          {/* Badge */}
          {badge !== undefined && badge !== false && (
            <span
              className={cn(
                "absolute -top-1 -right-2",
                "flex items-center justify-center",
                "min-w-[16px] h-4 px-1",
                "bg-destructive text-destructive-foreground",
                "text-[10px] font-medium",
                "rounded-full"
              )}
              data-testid={`bottom-navigation-badge-${value}`}
            >
              {typeof badge === "number" ? (badge > 99 ? "99+" : badge) : ""}
            </span>
          )}
        </span>

        {/* Label */}
        <span
          className={cn(
            "relative z-10 text-xs font-medium",
            "transition-colors duration-200",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </button>
    )
  }
)
BottomNavigationItem.displayName = "BottomNavigationItem"

export { BottomNavigation, BottomNavigationItem }
