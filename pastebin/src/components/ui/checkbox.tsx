import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <div className={cn("mat-mdc-checkbox", className)} data-testid="checkbox-wrapper">
      <div className="mdc-checkbox">
        <input
          ref={ref}
          type="checkbox"
          className="mdc-checkbox__native-control"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          data-testid="checkbox"
          {...props}
        />
        <div className="mdc-checkbox__background">
          <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24" aria-hidden="true">
            <path className="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
          </svg>
          <div className="mdc-checkbox__mixedmark" aria-hidden="true" />
        </div>
        <div className="mdc-checkbox__ripple" aria-hidden="true" />
      </div>
    </div>
  )
)
Checkbox.displayName = "Checkbox"
