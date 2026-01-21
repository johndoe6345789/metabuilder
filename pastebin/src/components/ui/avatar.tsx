"use client"

import { ComponentProps, useState } from "react"
import { cn } from "@/lib/utils"

function Avatar({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar"
      data-testid="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      role="img"
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({
  className,
  onError,
  ...props
}: ComponentProps<"img"> & { onError?: () => void }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) return null

  return (
    <img
      data-slot="avatar-image"
      data-testid="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      onError={() => {
        setHasError(true)
        onError?.()
      }}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      data-testid="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        "bg-gray-300 dark:bg-gray-600",
        "text-sm font-medium text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
