/**
 * @file tenant-context.ts
 * @description Tenant context stub
 */

export interface TenantContext {
  tenantId: string;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
  canCreateRecord?: boolean;
  canAddToList?: boolean;
  quota?: { used: number; limit: number };
  namespace?: string;
}
