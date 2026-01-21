"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? "div" : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      data-testid="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2",
        "text-xs font-medium",
        "text-gray-600 dark:text-gray-400",
        "transition-[margin,opacity] duration-200 ease-linear",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}
