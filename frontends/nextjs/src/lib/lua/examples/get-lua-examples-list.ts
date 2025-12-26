import type { LuaExampleKey } from './lua-examples-data'

export function getLuaExamplesList(): Array<{ key: LuaExampleKey; name: string; description: string }> {
  return [
    { key: 'basic', name: 'Hello World', description: 'Simple logging and return value' },
    { key: 'dataProcessing', name: 'Data Processing', description: 'Filter and process array data' },
    { key: 'validation', name: 'Validation', description: 'Input validation with error messages' },
    { key: 'transformation', name: 'Data Transformation', description: 'Transform data structure' },
    { key: 'calculation', name: 'Calculations', description: 'Business logic calculations' },
    { key: 'conditional', name: 'Conditional Logic', description: 'Decision making and branching' },
    { key: 'arrayOperations', name: 'Array Operations', description: 'Statistical array processing' },
    { key: 'stringManipulation', name: 'String Manipulation', description: 'Text processing and analysis' },
  ]
}
