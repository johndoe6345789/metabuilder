"use client"

import { ComponentProps } from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"

function ContextMenuSub({
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

export { ContextMenuSub }
