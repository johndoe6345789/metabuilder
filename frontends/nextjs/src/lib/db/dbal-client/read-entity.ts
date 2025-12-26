import { getModel } from './get-model'
import { getPrimaryKeyField } from './get-primary-key-field'

export async function readEntity(entity: string, id: string): Promise<unknown | null> {
  const model = getModel(entity)
  const primaryKeyField = getPrimaryKeyField(entity)
  return model.findUnique({ where: { [primaryKeyField]: id } })
}
