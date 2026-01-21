import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"

function MenubarPortal({
  ...props
}: ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

export { MenubarPortal }
