import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function MenubarShortcut({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export { MenubarShortcut }
