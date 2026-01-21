"use client"

import { ComponentProps } from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

function DropdownMenuGroup({
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

export { DropdownMenuGroup }
