"use client"

import * as React from "react"
import { ComponentProps, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, children }: DialogProps) {
  // If open is explicitly false, don't render
  if (open === false) return null
  return <>{children}</>
}

interface DialogTriggerProps extends ComponentProps<"button"> {
  children?: React.ReactNode
}

function DialogTrigger({ children, onClick, ...props }: DialogTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="dialog-trigger"
      {...props}
    >
      {children}
    </button>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}

function DialogOverlay({ className, onClick, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("cdk-overlay-backdrop cdk-overlay-dark-backdrop cdk-overlay-backdrop-showing", className)}
      onClick={onClick}
      aria-hidden="true"
      data-testid="dialog-overlay"
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  onClose,
  ...props
}: ComponentProps<"div"> & { onClose?: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <DialogPortal>
      <div className="cdk-overlay-container" data-testid="dialog-container">
        <div className="cdk-global-overlay-wrapper">
          <div className="cdk-overlay-pane">
            <DialogOverlay onClick={onClose} />
            <div className="mat-mdc-dialog-container mdc-dialog mdc-dialog--open">
              <div className="mat-mdc-dialog-inner-container">
                <div
                  ref={dialogRef}
                  className={cn("mat-mdc-dialog-surface mdc-dialog__surface", className)}
                  role="dialog"
                  aria-modal="true"
                  data-testid="dialog-content"
                  {...props}
                >
                  {children}
                  <button
                    type="button"
                    className="mat-mdc-icon-button mdc-icon-button"
                    onClick={onClose}
                    style={{ position: "absolute", right: "16px", top: "16px" }}
                    aria-label="Close dialog"
                    data-testid="dialog-close-btn"
                  >
                    <span className="mdc-icon-button__ripple" aria-hidden="true" />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mat-mdc-dialog-title", className)}
      data-testid="dialog-header"
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mat-mdc-dialog-actions", className)}
      data-testid="dialog-footer"
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("mat-mdc-dialog-title", className)}
      data-testid="dialog-title"
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mat-mdc-dialog-content", className)}
      data-testid="dialog-description"
      {...props}
    />
  )
}

function DialogClose({ children, onClick }: ComponentProps<"button">) {
  return (
    <button type="button" onClick={onClick} data-testid="dialog-close">
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
