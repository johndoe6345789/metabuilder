import type { LuaScript } from '@/lib/level-types'

interface ParameterHandlerProps {
  currentScript: LuaScript | null
  handleUpdateScript: (updates: Partial<LuaScript>) => void
}

interface TestInputHandlerProps {
  getTestInputs: () => Record<string, any>
  setTestInputs: (value: Record<string, any>) => void
}

export const createAddParameter = ({ currentScript, handleUpdateScript }: ParameterHandlerProps) => () => {
  if (!currentScript) return

  const newParam = {
    name: `param${currentScript.parameters.length + 1}`,
    type: 'string',
  }

  handleUpdateScript({ parameters: [...currentScript.parameters, newParam] })
}

export const createDeleteParameter = ({ currentScript, handleUpdateScript }: ParameterHandlerProps) => (
  index: number
) => {
  if (!currentScript) return

  handleUpdateScript({
    parameters: currentScript.parameters.filter((_, i) => i !== index),
  })
}

export const createUpdateParameter = ({ currentScript, handleUpdateScript }: ParameterHandlerProps) => (
  index: number,
  updates: { name?: string; type?: string }
) => {
  if (!currentScript) return

  handleUpdateScript({
    parameters: currentScript.parameters.map((param, i) =>
      i === index ? { ...param, ...updates } : param
    ),
  })
}

export const createUpdateTestInput = ({ getTestInputs, setTestInputs }: TestInputHandlerProps) => (
  name: string,
  value: any
) => {
  setTestInputs({ ...getTestInputs(), [name]: value })
}
