import { ComponentProps, forwardRef, createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps extends ComponentProps<"div"> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value: controlledValue, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const value = controlledValue ?? internalValue

    const handleValueChange = (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("mat-mdc-tab-group", className)} data-testid="tabs" role="tablist" {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

export const TabsList = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-tab-header", className)} data-testid="tabs-list" role="tablist" {...props} />
  )
)
TabsList.displayName = "TabsList"

export const TabsTrigger = forwardRef<HTMLButtonElement, ComponentProps<"button"> & { value: string }>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext)
    const isActive = context?.value === value

    return (
      <button
        ref={ref}
        className={cn(
          "mdc-tab",
          "mat-mdc-tab",
          isActive && "mdc-tab--active",
          className
        )}
        onClick={() => context?.onValueChange?.(value)}
        role="tab"
        aria-selected={isActive}
        data-testid={`tabs-trigger-${value}`}
        {...props}
      >
        <span className="mdc-tab__content">
          <span className="mdc-tab__text-label">{children}</span>
        </span>
        <span className="mdc-tab-indicator" aria-hidden="true">
          <span className="mdc-tab-indicator__content mdc-tab-indicator__content--underline" />
        </span>
        <span className="mdc-tab__ripple" aria-hidden="true" />
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = forwardRef<HTMLDivElement, ComponentProps<"div"> & { value: string }>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext)
    const isActive = context?.value === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn("mat-mdc-tab-body", "mat-mdc-tab-body-active", className)}
        role="tabpanel"
        data-testid={`tabs-content-${value}`}
        {...props}
      >
        <div className="mat-mdc-tab-body-content">
          {children}
        </div>
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"
