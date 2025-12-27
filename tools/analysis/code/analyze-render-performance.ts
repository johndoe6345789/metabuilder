#!/usr/bin/env tsx

import { runRenderPerformanceAnalysis } from './analyze-render-performance'

console.log(JSON.stringify(runRenderPerformanceAnalysis(), null, 2))
