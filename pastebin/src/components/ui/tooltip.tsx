"use client"

import React, { ComponentProps, useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({ children, asChild, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const context = React.useContext(TooltipContext)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      context?.setOpen(true)
    }, 700)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    context?.setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      "data-testid": "tooltip-trigger",
      ...props,
    })
  }

  return (
    <button
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="tooltip-trigger"
      {...props}
    >
      {children}
    </button>
  )
}

function TooltipContent({
  className,
  children,
  ...props
}: ComponentProps<"div"> & { sideOffset?: number }) {
  const context = React.useContext(TooltipContext)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!context?.open || !mounted) return null

  return createPortal(
    <div className="cdk-overlay-container">
      <div className="cdk-overlay-pane">
        <div
          className={cn(
            "mat-mdc-tooltip mdc-tooltip mat-mdc-tooltip-show",
            className
          )}
          role="tooltip"
          data-testid="tooltip-content"
          {...props}
        >
          <div className="mdc-tooltip__surface mdc-tooltip__surface-animation">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
