"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  ComponentProps,
  ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { X } from "@metabuilder/fakemui/icons"

import sidebarConfig from "@/data/sidebar-config.json"
import { useThemeConfig } from "@/hooks/use-theme-config"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar/use-sidebar"

// --- Inline Sheet components (only used by Sidebar mobile view) ---

interface SheetContextValue { open: boolean; onOpenChange: (open: boolean) => void }
const SheetContext = createContext<SheetContextValue | null>(null)
function useSheetContext() {
  const ctx = useContext(SheetContext)
  if (!ctx) throw new Error("Sheet compound components must be used within <Sheet>")
  return ctx
}

function Sheet({ open: controlledOpen, onOpenChange, children, ...rest }: ComponentProps<"div"> & { open?: boolean; onOpenChange?: (o: boolean) => void }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const handleOpenChange = useCallback((v: boolean) => { if (!isControlled) setUncontrolledOpen(v); onOpenChange?.(v) }, [isControlled, onOpenChange])
  return <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}><div data-slot="sheet" {...rest}>{children}</div></SheetContext.Provider>
}

function SheetContent({ className, children, side = "right", ...props }: ComponentProps<"div"> & { side?: "top" | "right" | "bottom" | "left" }) {
  const { open, onOpenChange } = useSheetContext()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false) }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h) }, [open, onOpenChange])
  if (!open || !mounted) return null
  return createPortal(
    <div data-slot="sheet-portal">
      <div data-slot="sheet-overlay" data-state="open" className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div role="dialog" aria-modal="true" data-slot="sheet-content" data-state="open" className={cn(
        "bg-background data-[state=open]:animate-in fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=open]:duration-500",
        side === "right" && "data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
        side === "left" && "data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        className
      )} {...props}>
        {children}
        <button type="button" className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none" onClick={() => onOpenChange(false)}>
          <X className="size-4" /><span className="sr-only">Close</span>
        </button>
      </div>
    </div>, document.body)
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
}
function SheetTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />
}
function SheetDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const { themeConfig } = useThemeConfig()

  const sidebarWidthMobile = themeConfig.sidebar?.widthMobile || "18rem"

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": sidebarWidthMobile,
            } as CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{sidebarConfig.labels.sidebarTitle}</SheetTitle>
            <SheetDescription>{sidebarConfig.labels.sidebarDescription}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { Sidebar }
