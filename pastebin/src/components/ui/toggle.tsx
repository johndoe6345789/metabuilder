import { ComponentProps, forwardRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ToggleProps extends ComponentProps<"button"> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  defaultPressed?: boolean
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      pressed: controlledPressed,
      onPressedChange,
      defaultPressed = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed)
    const isPressed =
      controlledPressed !== undefined ? controlledPressed : uncontrolledPressed

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !isPressed
      setUncontrolledPressed(newPressed)
      onPressedChange?.(newPressed)
      onClick?.(e)
    }

    const sizeClasses = {
      default: "h-9 px-2 min-w-9",
      sm: "h-8 px-1.5 min-w-8",
      lg: "h-10 px-2.5 min-w-10",
    }[size]

    const variantClasses = {
      default: "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700",
      outline:
        "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    }[variant]

    return (
      <button
        ref={ref}
        data-slot="toggle"
        data-state={isPressed ? "on" : "off"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:ring-2 focus-visible:ring-offset-2",
          "transition-colors",
          "[&_svg]:pointer-events-none [&_svg:not([class*='w-'])]:w-4 [&_svg]:shrink-0",
          variantClasses,
          isPressed && "bg-blue-600 dark:bg-blue-500 text-white",
          sizeClasses,
          className
        )}
        onClick={handleClick}
        aria-pressed={isPressed}
        data-testid="toggle"
        {...props}
      />
    )
  }
)
Toggle.displayName = "Toggle"

function toggleVariants() {
  return ""
}

export { Toggle, toggleVariants }
