import { getModel } from '../../utils/get-model'
import { getPrimaryKeyField } from '../../utils/get-primary-key-field'

export async function updateEntity(
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<unknown> {
  const model = getModel(entity)
  const primaryKeyField = getPrimaryKeyField(entity)
  // Filter out undefined values
  const cleanData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value
    }
  }
  return model.update({ where: { [primaryKeyField]: id }, data: cleanData })
}
