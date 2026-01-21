import { ComponentProps, forwardRef, createContext, useContext } from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

interface RadioGroupProps extends ComponentProps<"div"> {
  value?: string
  onValueChange?: (value: string) => void
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn("mat-mdc-radio-group", className)} role="radiogroup" data-testid="radio-group" {...props} />
    </RadioGroupContext.Provider>
  )
)
RadioGroup.displayName = "RadioGroup"

export const RadioGroupItem = forwardRef<HTMLInputElement, ComponentProps<"input"> & { value: string }>(
  ({ className, value, ...props }, ref) => {
    const context = useContext(RadioGroupContext)
    const isChecked = context?.value === value

    return (
      <div className={cn("mat-mdc-radio-button", className)} data-testid={`radio-group-item-${value}`}>
        <div className="mdc-radio">
          <input
            ref={ref}
            type="radio"
            className="mdc-radio__native-control"
            checked={isChecked}
            onChange={() => context?.onValueChange?.(value)}
            data-testid="radio-input"
            {...props}
          />
          <div className="mdc-radio__background" aria-hidden="true">
            <div className="mdc-radio__outer-circle" />
            <div className="mdc-radio__inner-circle" />
          </div>
          <div className="mdc-radio__ripple" aria-hidden="true" />
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"
