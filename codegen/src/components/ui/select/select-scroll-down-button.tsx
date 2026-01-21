import { ComponentProps } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import ChevronDownIcon from "lucide-react/dist/esm/icons/chevron-down"

import { cn } from "@/lib/utils"

function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export { SelectScrollDownButton }
