"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  children,
  defaultOpen = false,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const setOpen = (newOpen: boolean) => {
    setUncontrolledOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <AlertDialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialog")
  }
  return context
}

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(true)
        onClick?.(e)
      }}
      data-testid="alert-dialog-trigger"
      {...props}
    />
  )
})
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => {
  const { open } = useAlertDialog()
  if (!open) return null

  return <>{children}</>
}
AlertDialogPortal.displayName = "AlertDialogPortal"

const AlertDialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog()
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false)
        }
        onClick?.(e)
      }}
      data-testid="alert-dialog-overlay"
      aria-hidden="true"
      {...props}
    />
  )
})
AlertDialogOverlay.displayName = "AlertDialogOverlay"

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <div
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-950",
        "p-6 shadow-lg",
        className
      )}
      role="alertdialog"
      aria-modal="true"
      data-testid="alert-dialog-content"
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    data-testid="alert-dialog-header"
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    data-testid="alert-dialog-footer"
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    data-testid="alert-dialog-title"
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    data-testid="alert-dialog-description"
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog()
  return (
    <button
      ref={ref}
      className={cn(
        "mat-mdc-unelevated-button",
        "px-4 py-2 rounded-md font-medium",
        "bg-blue-600 hover:bg-blue-700 text-white",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      data-testid="alert-dialog-action"
      {...props}
    />
  )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog()
  return (
    <button
      ref={ref}
      className={cn(
        "mat-mdc-outlined-button",
        "px-4 py-2 rounded-md font-medium mt-2 sm:mt-0",
        "border border-gray-300 dark:border-gray-600",
        "hover:bg-gray-100 dark:hover:bg-gray-900",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      data-testid="alert-dialog-cancel"
      {...props}
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
