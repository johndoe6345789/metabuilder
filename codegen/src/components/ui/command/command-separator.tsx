"use client"

import { ComponentProps } from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"

function CommandSeparator({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

export { CommandSeparator }
