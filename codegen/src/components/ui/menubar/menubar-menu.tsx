import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"

function MenubarMenu({
  ...props
}: ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

export { MenubarMenu }
