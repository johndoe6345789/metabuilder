#!/usr/bin/env tsx
import { orchestrateRefactor } from '../runners/orchestrator/orchestrate-refactor'

orchestrateRefactor(process.argv.slice(2)).catch(console.error)
