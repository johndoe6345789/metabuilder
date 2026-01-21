"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      data-testid="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}
