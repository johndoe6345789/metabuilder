import { getModel } from './get-model'

export async function updateEntity(
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<unknown> {
  const model = getModel(entity)
  // Filter out undefined values
  const cleanData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value
    }
  }
  return model.update({ where: { id }, data: cleanData })
}
