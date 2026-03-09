"use client"

import { ComponentProps } from "react"
import { Sidebar as PanelLeftIcon } from "@metabuilder/fakemui/icons"

import sidebarConfig from "@/data/sidebar-config.json"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar/use-sidebar"

function SidebarTrigger({ className, onClick, ...props }: ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">{sidebarConfig.labels.toggleSidebar}</span>
    </Button>
  )
}

export { SidebarTrigger }
