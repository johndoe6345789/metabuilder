"use client"

import { ComponentProps } from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"

function CommandList({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

export { CommandList }
