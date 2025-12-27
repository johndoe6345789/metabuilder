import { DBALError } from '../../../core/foundation/errors'
import type { TenantContext } from '../core/tenant-context'

export const ensureCanReadBlob = (context: TenantContext): void => {
  if (!context.canRead('blob')) {
    throw DBALError.forbidden('Permission denied: cannot read blobs')
  }
}

export const ensureCanWriteBlob = (context: TenantContext): void => {
  if (!context.canWrite('blob')) {
    throw DBALError.forbidden('Permission denied: cannot write blobs')
  }
}

export const ensureCanDeleteBlob = (context: TenantContext): void => {
  if (!context.canDelete('blob')) {
    throw DBALError.forbidden('Permission denied: cannot delete blobs')
  }
}
