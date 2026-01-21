"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? "div" : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      data-testid="sidebar-group-action"
      className={cn(
        "mat-mdc-button mat-icon-button",
        "absolute top-3.5 right-3",
        "flex items-center justify-center",
        "w-5 h-5 p-0",
        "rounded-md",
        "transition-transform",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}
