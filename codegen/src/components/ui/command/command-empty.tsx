"use client"

import { ComponentProps } from "react"
import { Command as CommandPrimitive } from "cmdk"

function CommandEmpty({
  ...props
}: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

export { CommandEmpty }
