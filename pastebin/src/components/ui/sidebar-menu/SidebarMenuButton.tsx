"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "../sidebar-context"

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | ComponentProps<typeof TooltipContent>
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}) {
  const Comp = asChild ? "div" : "button"
  const { isMobile, state } = useSidebar()

  const sizeClasses = {
    default: "h-8 text-sm",
    sm: "h-7 text-xs",
    lg: "h-12 text-sm",
  }[size]

  const variantClasses = {
    default: "hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800",
  }[variant]

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-testid="sidebar-menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2",
        "text-left text-sm outline-hidden",
        "transition-[width,height,padding] duration-200",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&>span:last-child]:truncate",
        "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0",
        variantClasses,
        isActive && "bg-blue-600 dark:bg-blue-500 text-white font-medium",
        "group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-2",
        sizeClasses,
        className
      )}
      aria-pressed={isActive}
      {...props}
    >
      {children}
    </Comp>
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}
