import { createContext } from "react"

import type { ChartConfig } from "./chart-constants"

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextProps | null>(null)

export type { ChartContextProps }
export { ChartContext }
