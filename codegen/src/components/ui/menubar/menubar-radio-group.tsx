import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"

function MenubarRadioGroup({
  ...props
}: ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

export { MenubarRadioGroup }
