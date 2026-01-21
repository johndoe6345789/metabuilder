import { ComponentProps } from "react"

interface AspectRatioProps extends ComponentProps<"div"> {
  ratio?: number
}

function AspectRatio({
  ratio = 16 / 9,
  style,
  children,
  ...props
}: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      data-testid="aspect-ratio"
      style={{
        ...style,
        aspectRatio: ratio,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { AspectRatio }
