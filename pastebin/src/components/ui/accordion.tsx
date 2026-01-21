import React, { ComponentProps, forwardRef, useState, createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { CaretDown } from "@phosphor-icons/react"

interface AccordionContextValue {
  openItems: Set<string>
  toggleItem: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

interface AccordionProps extends ComponentProps<"div"> {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
}

export function Accordion({
  type = "single",
  defaultValue,
  children,
  className,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
  })

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        if (type === "single") {
          next.clear()
        }
        next.add(value)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("mat-accordion", className)} data-testid="accordion" role="region" {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export const AccordionItem = forwardRef<HTMLDivElement, ComponentProps<"div"> & { value: string }>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(AccordionContext)
    const isExpanded = context?.openItems.has(value)

    return (
      <div
        ref={ref}
        className={cn(
          "mat-expansion-panel",
          isExpanded && "mat-expanded",
          className
        )}
        data-value={value}
        data-testid="accordion-item"
        role="article"
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

export const AccordionTrigger = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(AccordionContext)
    const [value, setValue] = React.useState("")

    React.useEffect(() => {
      if (!ref || typeof ref === "function") return
      const item = ref.current?.closest("[data-value]")
      setValue(item?.getAttribute("data-value") || "")
    }, [ref])

    return (
      <button
        ref={ref}
        className={cn("mat-expansion-panel-header", className)}
        onClick={() => context?.toggleItem(value)}
        data-testid="accordion-trigger"
        aria-expanded={context?.openItems.has(value) ?? false}
        {...props}
      >
        <span className="mat-content">
          <span className="mat-expansion-panel-header-title">{children}</span>
        </span>
        <span className="mat-expansion-indicator" aria-hidden="true">
          <CaretDown />
        </span>
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

export const AccordionContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(AccordionContext)
    const [value, setValue] = React.useState("")
    const isExpanded = context?.openItems.has(value)

    React.useEffect(() => {
      if (!ref || typeof ref === "function") return
      const item = ref.current?.closest("[data-value]")
      setValue(item?.getAttribute("data-value") || "")
    }, [ref])

    if (!isExpanded) return null

    return (
      <div className="mat-expansion-panel-content" role="region" aria-hidden={!isExpanded}>
        <div
          ref={ref}
          className={cn("mat-expansion-panel-body", className)}
          data-testid="accordion-content"
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"
