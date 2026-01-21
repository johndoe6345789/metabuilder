"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarMenuSubItem({
  className,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      data-testid="sidebar-menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}
