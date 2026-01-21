import { ComponentProps, forwardRef, useState, createContext, useContext } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  )
}

export const SelectTrigger = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
      <button
        ref={ref}
        className={cn("mat-mdc-select-trigger", className)}
        onClick={() => context?.setOpen(!context.open)}
        data-testid="select-trigger"
        role="combobox"
        aria-expanded={context?.open}
        {...props}
      >
        <span className="mat-mdc-select-value">{children}</span>
        <span className="mat-mdc-select-arrow-wrapper" aria-hidden="true">
          <svg className="mat-mdc-select-arrow" viewBox="0 0 10 5" aria-hidden="true">
            <polygon points="0,0 5,5 10,0" />
          </svg>
        </span>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = useContext(SelectContext)
  return <>{context?.value || placeholder}</>
}

export const SelectContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(SelectContext)

    if (!context?.open) return null

    return createPortal(
      <div className="cdk-overlay-pane">
        <div
          ref={ref}
          className={cn("mat-mdc-select-panel", className)}
          data-testid="select-content"
          role="listbox"
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  }
)
SelectContent.displayName = "SelectContent"

export const SelectItem = forwardRef<HTMLDivElement, ComponentProps<"div"> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const context = useContext(SelectContext)
    const isSelected = context?.value === value

    return (
      <div
        ref={ref}
        className={cn(
          "mat-mdc-option",
          "mdc-list-item",
          isSelected && "mdc-list-item--selected",
          className
        )}
        onClick={() => {
          context?.onValueChange?.(value)
          context?.setOpen(false)
        }}
        role="option"
        aria-selected={isSelected}
        data-testid={`select-item-${value}`}
        {...props}
      >
        <span className="mdc-list-item__primary-text">{children}</span>
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export const SelectGroup = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-optgroup", className)} role="group" data-testid="select-group" {...props} />
  )
)
SelectGroup.displayName = "SelectGroup"

export const SelectLabel = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-mdc-optgroup-label", className)} data-testid="select-label" {...props} />
  )
)
SelectLabel.displayName = "SelectLabel"

export const SelectSeparator = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mat-divider", className)} role="separator" data-testid="select-separator" aria-hidden="true" {...props} />
  )
)
SelectSeparator.displayName = "SelectSeparator"

export const SelectScrollUpButton = () => null
export const SelectScrollDownButton = () => null
