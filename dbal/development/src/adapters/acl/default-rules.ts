/**
 * @file default-rules.ts
 * @description Default ACL rules for entities
 */

import type { ACLRule } from '../acl-adapter/types'

export const defaultACLRules: ACLRule[] = [
  {
    entity: 'User',
    roles: ['user'],
    operations: ['read', 'update'],
    rowLevelFilter: (user, data) => data.id === user.id
  },
  {
    entity: 'User',
    roles: ['admin', 'god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'PageConfig',
    roles: ['user', 'admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'PageConfig',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
  {
    entity: 'ComponentNode',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'Workflow',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'InstalledPackage',
    roles: ['admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'InstalledPackage',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
  {
    entity: 'PackageData',
    roles: ['admin', 'god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
]
