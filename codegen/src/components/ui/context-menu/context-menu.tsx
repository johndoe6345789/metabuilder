"use client"

import { ComponentProps } from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"

function ContextMenu({
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

export { ContextMenu }
