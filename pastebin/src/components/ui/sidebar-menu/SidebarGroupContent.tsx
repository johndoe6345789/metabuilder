"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function SidebarGroupContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      data-testid="sidebar-group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}
