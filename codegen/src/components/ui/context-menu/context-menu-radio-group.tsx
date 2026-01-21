"use client"

import { ComponentProps } from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"

function ContextMenuRadioGroup({
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

export { ContextMenuRadioGroup }
