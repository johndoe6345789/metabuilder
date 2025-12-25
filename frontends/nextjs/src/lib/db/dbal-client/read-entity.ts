import { getModel } from './get-model'

export async function readEntity(entity: string, id: string): Promise<unknown | null> {
  const model = getModel(entity)
  return model.findUnique({ where: { id } })
}
