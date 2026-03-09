import { InputParameter } from '@/lib/types'

export function parseInputParameters(inputParameters?: InputParameter[]): Record<string, unknown> {
  if (!inputParameters || inputParameters.length === 0) {
    return {}
  }

  const parsedProps: Record<string, unknown> = {}

  inputParameters.forEach((param) => {
    try {
      if (param.type === 'string') {
        parsedProps[param.name] = param.defaultValue.replace(/^["']|["']$/g, '')
      } else if (param.type === 'number') {
        parsedProps[param.name] = Number(param.defaultValue)
      } else if (param.type === 'boolean') {
        parsedProps[param.name] = param.defaultValue === 'true'
      } else if (param.type === 'array' || param.type === 'object') {
        parsedProps[param.name] = JSON.parse(param.defaultValue)
      }
    } catch (err) {
      console.warn(`Failed to parse parameter ${param.name}:`, err)
      parsedProps[param.name] = param.defaultValue
    }
  })

  return parsedProps
}
