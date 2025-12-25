import type { AccessRule } from './types'

export const ACCESS_RULES: AccessRule[] = [
  { resource: 'user', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'user', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'user', operation: 'UPDATE', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'user', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'workflow', operation: 'READ', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'workflow', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'workflow', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'workflow', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'luaScript', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'pageConfig', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'pageConfig', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'pageConfig', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'pageConfig', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'modelSchema', operation: 'READ', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'modelSchema', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'modelSchema', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'modelSchema', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'comment', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'CREATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'UPDATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'DELETE', allowedRoles: ['admin', 'god', 'supergod'] },
  
  { resource: 'smtpConfig', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'smtpConfig', operation: 'UPDATE', allowedRoles: ['supergod'] },
  
  { resource: 'credential', operation: 'READ', allowedRoles: ['public', 'user', 'admin', 'god', 'supergod'] },
  { resource: 'credential', operation: 'UPDATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  
  { resource: 'tenant', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'tenant', operation: 'CREATE', allowedRoles: ['supergod'] },
  { resource: 'tenant', operation: 'UPDATE', allowedRoles: ['supergod'] },
  { resource: 'tenant', operation: 'DELETE', allowedRoles: ['supergod'] },
]
