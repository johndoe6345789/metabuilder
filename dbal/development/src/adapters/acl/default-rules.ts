/**
 * @file default-rules.ts
 * @description Default ACL rules for entities
 */

import type { ACLRule } from './types'

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
    entity: 'PageView',
    roles: ['user', 'admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'PageView',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
  {
    entity: 'ComponentHierarchy',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'Workflow',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'LuaScript',
    roles: ['god', 'supergod'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  },
  {
    entity: 'Package',
    roles: ['admin', 'god', 'supergod'],
    operations: ['read', 'list']
  },
  {
    entity: 'Package',
    roles: ['god', 'supergod'],
    operations: ['create', 'update', 'delete']
  },
]
