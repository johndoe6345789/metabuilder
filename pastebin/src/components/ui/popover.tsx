"use client"

import React, { ComponentProps, useState, useRef, useEffect, createContext, useContext, isValidElement, cloneElement } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ children, asChild, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const context = useContext(PopoverContext)

  const handleClick = () => {
    context?.setOpen(!context.open)
  }

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      "data-testid": "popover-trigger",
      ...props,
    })
  }

  return (
    <button type="button" onClick={handleClick} data-testid="popover-trigger" {...props}>
      {children}
    </button>
  )
}

function PopoverContent({
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const context = useContext(PopoverContext)
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!context?.open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        context.setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        context.setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [context])

  if (!context?.open || !mounted) return null

  return createPortal(
    <div className="cdk-overlay-container">
      <div className="cdk-overlay-pane">
        <div
          ref={contentRef}
          className={cn("mat-mdc-menu-panel", className)}
          role="dialog"
          data-testid="popover-content"
          {...props}
        >
          <div className="mat-mdc-menu-content">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function PopoverClose({ children, className, ...props }: ComponentProps<"button">) {
  const context = useContext(PopoverContext)

  return (
    <button
      type="button"
      onClick={() => context?.setOpen(false)}
      className={cn("mat-mdc-icon-button", className)}
      data-testid="popover-close"
      aria-label="Close popover"
      {...props}
    >
      {children}
    </button>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose }
