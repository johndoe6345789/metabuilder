"use client"

import { ComponentProps, createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupContextType {
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  type?: "single" | "multiple"
}

const ToggleGroupContext = createContext<ToggleGroupContextType>({
  size: "default",
  variant: "default",
  type: "single",
})

interface ToggleGroupProps extends ComponentProps<"div"> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  type?: "single" | "multiple"
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  value: controlledValue,
  onValueChange,
  type = "single",
  children,
  ...props
}: ToggleGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(
    type === "single" ? "" : []
  )
  const actualValue = controlledValue !== undefined ? controlledValue : uncontrolledValue

  const handleValueChange = (newValue: string | string[]) => {
    setUncontrolledValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div
      data-slot="toggle-group"
      data-testid="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group inline-flex items-center rounded-md",
        variant === "outline" && "shadow-sm",
        className
      )}
      role="group"
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          value: actualValue,
          onValueChange: handleValueChange,
          type,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
}

interface ToggleGroupItemProps extends ComponentProps<"button"> {
  value: string
}

function ToggleGroupItem({
  className,
  value,
  onClick,
  ...props
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext)
  const isPressed =
    context.type === "single"
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (context.type === "single") {
      context.onValueChange?.(value)
    } else {
      const newValue = Array.isArray(context.value) ? [...context.value] : []
      if (newValue.includes(value)) {
        newValue.splice(newValue.indexOf(value), 1)
      } else {
        newValue.push(value)
      }
      context.onValueChange?.(newValue)
    }
    onClick?.(e)
  }

  const sizeClasses = {
    default: "h-9 px-2 min-w-9",
    sm: "h-8 px-1.5 min-w-8",
    lg: "h-10 px-2.5 min-w-10",
  }[context.size || "default"]

  const variantClasses = {
    default: "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700",
    outline:
      "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800",
  }[context.variant || "default"]

  return (
    <button
      data-slot="toggle-group-item"
      data-testid={`toggle-group-item-${value}`}
      data-variant={context.variant}
      data-size={context.size}
      className={cn(
        "inline-flex items-center justify-center rounded-none text-sm font-medium",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus:z-10 focus-visible:z-10",
        "transition-colors",
        "first:rounded-l-md last:rounded-r-md",
        context.variant === "outline" && "border-l-0 first:border-l",
        variantClasses,
        isPressed && "bg-blue-600 dark:bg-blue-500 text-white",
        sizeClasses,
        className
      )}
      onClick={handleClick}
      aria-pressed={isPressed}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
