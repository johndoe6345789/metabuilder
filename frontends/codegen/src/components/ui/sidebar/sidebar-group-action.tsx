import { cloneElement, ComponentProps, isValidElement, ReactNode } from "react"

import { cn } from "@/lib/utils"

function Slot({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) {
  if (isValidElement(children)) return cloneElement(children, { ...props, ...(children.props || {}) })
  return <>{children}</>
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { SidebarGroupAction }
