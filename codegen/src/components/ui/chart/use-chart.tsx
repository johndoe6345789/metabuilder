import { useContext } from "react"

import { ChartContext } from "./chart-context"

function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

export { useChart }
