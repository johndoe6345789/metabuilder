"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? "div" : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      data-testid="sidebar-menu-action"
      className={cn(
        "mat-mdc-button mat-icon-button",
        "absolute top-1.5 right-1",
        "flex items-center justify-center",
        "w-5 h-5 p-0",
        "rounded-md",
        "transition-transform",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}
