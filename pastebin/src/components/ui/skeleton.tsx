import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      data-testid="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      aria-busy="true"
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
