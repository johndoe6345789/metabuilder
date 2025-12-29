import type { User } from '@/lib/types/level-types'

import { sanitizeInput } from './sanitize-input'
import type { SecurityContext } from './types'

export interface LoginSecurityContextParams {
  identifier: string
  tenantId?: string
  ipAddress?: string
  requestId?: string
}

export const createLoginSecurityContext = (params: LoginSecurityContextParams): SecurityContext => {
  const sanitizedIdentifier = sanitizeInput(params.identifier).trim()
  const loginKey = sanitizedIdentifier.length > 0 ? sanitizedIdentifier : 'public'

  const user: User = {
    id: `login:${loginKey}`,
    username: loginKey,
    email: `${loginKey}@login.local`,
    role: 'public',
    createdAt: Date.now(),
    tenantId: params.tenantId,
    isInstanceOwner: false,
  }

  return {
    user,
    ipAddress: params.ipAddress,
    requestId: params.requestId,
  }
}
