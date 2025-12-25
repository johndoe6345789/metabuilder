import type { User } from '../../types/level-types'
import { createDBALClient } from './create-dbal-client'

export function getDBALClient(user?: User, session?: { id: string; token: string }) {
  return createDBALClient(user, session)
}
