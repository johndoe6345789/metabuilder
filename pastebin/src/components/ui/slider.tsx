import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<ComponentProps<"input">, "type"> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value[0] || 0
    const percentage = ((currentValue - min) / (max - min)) * 100

    return (
      <div className={cn("mat-mdc-slider", "mdc-slider", className)} data-testid="slider-wrapper">
        <input
          ref={ref}
          type="range"
          className="mdc-slider__input"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onValueChange?.([Number(e.target.value)])}
          data-testid="slider"
          {...props}
        />
        <div className="mdc-slider__track" aria-hidden="true">
          <div className="mdc-slider__track--inactive" />
          <div
            className="mdc-slider__track--active"
            style={{ transform: `scaleX(${percentage / 100})` }}
          >
            <div className="mdc-slider__track--active_fill" />
          </div>
        </div>
        <div
          className="mdc-slider__thumb"
          style={{ left: `${percentage}%` }}
          aria-hidden="true"
        >
          <div className="mdc-slider__thumb-knob" />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"
