import { createContext } from "react"
import type { UseEmblaCarouselType } from "embla-carousel-react"

import type { CarouselProps } from "./carousel-types"

type CarouselContextProps = {
  carouselRef: UseEmblaCarouselType[0]
  api: UseEmblaCarouselType[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = createContext<CarouselContextProps | null>(null)

export type { CarouselContextProps }
export { CarouselContext }
