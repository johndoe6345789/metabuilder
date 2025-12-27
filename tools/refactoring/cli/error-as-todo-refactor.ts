#!/usr/bin/env tsx
import { runErrorAsTodo } from '../runners/error-as-todo/run-error-as-todo'

runErrorAsTodo(process.argv.slice(2)).catch(console.error)
