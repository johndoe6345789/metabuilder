import { ComponentProps } from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import ChevronDownIcon from "lucide-react/dist/esm/icons/chevron-down"

import { cn } from "@/lib/utils"

import { navigationMenuTriggerStyle } from "./navigation-menu-trigger-style"

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

export { NavigationMenuTrigger }
