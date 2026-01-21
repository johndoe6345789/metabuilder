import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"

function MenubarGroup({
  ...props
}: ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

export { MenubarGroup }
