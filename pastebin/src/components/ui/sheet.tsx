"use client"

import * as React from "react"
import { ComponentProps, ReactNode, useState } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface SheetContextType {
  open: boolean
  setOpen: (open: boolean) => void
  side: "top" | "bottom" | "left" | "right"
}

const SheetContext = React.createContext<SheetContextType | null>(null)

function Sheet({
  open: controlledOpen,
  onOpenChange,
  children,
  defaultOpen = false,
  side = "right",
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  defaultOpen?: boolean
  side?: "top" | "bottom" | "left" | "right"
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const setOpen = (newOpen: boolean) => {
    setUncontrolledOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen, side }}>
      {children}
    </SheetContext.Provider>
  )
}

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("useSheet must be used within Sheet")
  }
  return context
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  ComponentProps<"button">
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useSheet()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(true)
        onClick?.(e)
      }}
      data-testid="sheet-trigger"
      {...props}
    />
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetPortal = ({ children }: { children: ReactNode }) => {
  const { open } = useSheet()
  if (!open) return null

  return <>{children}</>
}
SheetPortal.displayName = "SheetPortal"

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  ComponentProps<"div">
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useSheet()
  return (
    <div
      ref={ref}
      data-slot="sheet-overlay"
      data-testid="sheet-overlay"
      className={cn(
        "fixed inset-0 z-40 bg-black/80",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false)
        }
        onClick?.(e)
      }}
      aria-hidden="true"
      {...props}
    />
  )
})
SheetOverlay.displayName = "SheetOverlay"

interface SheetContentProps extends ComponentProps<"div"> {
  side?: "top" | "bottom" | "left" | "right"
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side: propSide, className, children, ...props }, ref) => {
    const { open, setOpen, side: contextSide } = useSheet()
    const actualSide = propSide || contextSide

    const sideClasses = {
      top: "inset-x-0 top-0 border-b max-h-[80vh] animate-slide-up",
      bottom: "inset-x-0 bottom-0 border-t max-h-[80vh] animate-slide-down",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm animate-slide-right",
      right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm animate-slide-left",
    }[actualSide]

    return (
      <SheetPortal>
        <SheetOverlay />
        <div
          ref={ref}
          data-slot="sheet-content"
          data-state={open ? "open" : "closed"}
          data-testid="sheet-content"
          className={cn(
            "fixed z-50 gap-4 bg-white dark:bg-gray-950 p-6 shadow-lg",
            "transition ease-in-out duration-300",
            sideClasses,
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
          <button
            onClick={() => setOpen(false)}
            className={cn(
              "absolute top-4 right-4 p-1 rounded-sm",
              "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
              "focus-visible:ring-2 focus-visible:ring-offset-2"
            )}
            aria-label="Close sheet"
            data-testid="sheet-close-button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  ComponentProps<"button">
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useSheet()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(false)
        onClick?.(e)
      }}
      data-slot="sheet-close"
      data-testid="sheet-close"
      {...props}
    />
  )
})
SheetClose.displayName = "SheetClose"

function SheetHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      data-testid="sheet-header"
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      data-testid="sheet-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  ComponentProps<"h2">
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="sheet-title"
    data-testid="sheet-title"
    className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  ComponentProps<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="sheet-description"
    data-testid="sheet-description"
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
