"use client"

import { ComponentProps } from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"

function ContextMenuGroup({
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

export { ContextMenuGroup }
