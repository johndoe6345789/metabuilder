"use client"

import { ComponentProps } from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"

function Command({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Command }
