"use client"

import { CSSProperties, ComponentProps, useCallback, useEffect, useMemo, useState } from "react"

import sidebarConfig from "@/data/sidebar-config.json"
import { useIsMobile } from "@/hooks/use-mobile"
import { useThemeConfig } from "@/hooks/use-theme-config"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarContext, SidebarContextProps } from "@/components/ui/sidebar/sidebar-context"

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const { themeConfig } = useThemeConfig()
  const [openMobile, setOpenMobile] = useState(false)

  const sidebarWidth = themeConfig.sidebar?.width || "16rem"
  const sidebarWidthIcon = themeConfig.sidebar?.widthIcon || "3rem"

  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${sidebarConfig.cookie.name}=${openState}; path=/; max-age=${sidebarConfig.cookie.maxAgeSeconds}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((value) => !value) : setOpen((value) => !value)
  }, [isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === sidebarConfig.keyboardShortcut &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": sidebarWidth,
              "--sidebar-width-icon": sidebarWidthIcon,
              ...style,
            } as CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export { SidebarProvider }
