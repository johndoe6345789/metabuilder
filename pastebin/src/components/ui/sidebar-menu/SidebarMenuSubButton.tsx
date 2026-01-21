"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? "div" : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-testid="sidebar-menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "mat-mdc-list-item",
        "flex h-7 min-w-0 items-center gap-2",
        "overflow-hidden rounded-md px-2",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "active:bg-gray-300 dark:active:bg-gray-600",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "[&>span:last-child]:truncate",
        "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0",
        isActive && "bg-gray-300 dark:bg-gray-600",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  )
}
