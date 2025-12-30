/**
 * @file resolve-permission-operation.ts
 * @description Resolve DBAL operation to ACL permission operation
 */

/**
 * Maps complex DBAL operations to their base permission operations
 */
export const resolvePermissionOperation = (operation: string): string => {
  switch (operation) {
    case 'findFirst':
    case 'findByField':
      return 'read'
    case 'createMany':
      return 'create'
    case 'updateByField':
    case 'updateMany':
      return 'update'
    case 'deleteByField':
    case 'deleteMany':
      return 'delete'
    default:
      return operation
  }
}
