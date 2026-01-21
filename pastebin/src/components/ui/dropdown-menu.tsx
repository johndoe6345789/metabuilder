"use client"

import React, { ComponentProps, createContext, useContext, useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}

function DropdownMenuTrigger({ children, asChild, className, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const context = useContext(DropdownMenuContext)

  const handleClick = () => {
    context?.setOpen(!context.open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      "data-testid": "dropdown-menu-trigger",
      ...props,
    })
  }

  return (
    <button type="button" onClick={handleClick} className={className} data-testid="dropdown-menu-trigger" {...props}>
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  children,
  ...props
}: ComponentProps<"div"> & { align?: "start" | "center" | "end"; sideOffset?: number }) {
  const context = useContext(DropdownMenuContext)
  const contentRef = useRef<HTMLDivElement>(null)

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

  if (!context?.open) return null

  return (
    <DropdownMenuPortal>
      <div className="cdk-overlay-container">
        <div className="cdk-overlay-pane">
          <div
            ref={contentRef}
            className={cn("mat-mdc-menu-panel mat-menu-panel-animations-enabled", className)}
            role="menu"
            data-testid="dropdown-menu-content"
            {...props}
          >
            <div className="mat-mdc-menu-content">
              {children}
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuPortal>
  )
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div role="group" data-testid="dropdown-menu-group">{children}</div>
}

function DropdownMenuItem({
  className,
  variant = "default",
  onClick,
  children,
  ...props
}: ComponentProps<"button"> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const context = useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    context?.setOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "mat-mdc-menu-item mdc-list-item",
        variant === "destructive" && "mat-warn",
        className
      )}
      onClick={handleClick}
      data-testid="dropdown-menu-item"
      {...props}
    >
      <span className="mdc-list-item__primary-text">{children}</span>
      <div className="mat-mdc-menu-ripple mat-ripple" aria-hidden="true" />
    </button>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ComponentProps<"button"> & { checked?: boolean }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      className={cn("mat-mdc-menu-item mdc-list-item", className)}
      data-testid="dropdown-menu-checkbox-item"
      {...props}
    >
      <span className="mdc-list-item__primary-text">{children}</span>
      {checked && (
        <span className="mdc-list-item__end" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </button>
  )
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <div role="radiogroup" data-testid="dropdown-menu-radio-group">{children}</div>
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      role="menuitemradio"
      className={cn("mat-mdc-menu-item mdc-list-item", className)}
      data-testid="dropdown-menu-radio-item"
      {...props}
    >
      <span className="mdc-list-item__primary-text">{children}</span>
    </button>
  )
}

function DropdownMenuLabel({ className, ...props }: ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div
      className={cn("mat-mdc-optgroup-label", className)}
      data-testid="dropdown-menu-label"
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      className={cn("mat-divider", className)}
      role="separator"
      data-testid="dropdown-menu-separator"
      aria-hidden="true"
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={className}
      style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.6 }}
      data-testid="dropdown-menu-shortcut"
      {...props}
    />
  )
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<"button"> & { inset?: boolean }) {
  return (
    <button
      type="button"
      className={cn("mat-mdc-menu-item mdc-list-item", className)}
      data-testid="dropdown-menu-sub-trigger"
      {...props}
    >
      <span className="mdc-list-item__primary-text">{children}</span>
      <span className="mat-mdc-menu-submenu-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </span>
    </button>
  )
}

function DropdownMenuSubContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mat-mdc-menu-panel", className)}
      role="menu"
      data-testid="dropdown-menu-sub-content"
      {...props}
    >
      <div className="mat-mdc-menu-content">
        {children}
      </div>
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
