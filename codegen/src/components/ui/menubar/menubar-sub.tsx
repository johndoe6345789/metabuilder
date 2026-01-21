import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"

function MenubarSub({
  ...props
}: ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

export { MenubarSub }
