#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const header = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}`

const models = [
  {
    name: 'User',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'username', type: 'String', attributes: ['@unique'] },
      { name: 'email', type: 'String', attributes: ['@unique'] },
      { name: 'role', type: 'String' },
      { name: 'profilePicture', type: 'String?' },
      { name: 'bio', type: 'String?' },
      { name: 'createdAt', type: 'BigInt' },
      { name: 'tenantId', type: 'String?' },
      { name: 'isInstanceOwner', type: 'Boolean', attributes: ['@default(false)'] },
      { name: 'passwordChangeTimestamp', type: 'BigInt?' },
      { name: 'firstLogin', type: 'Boolean', attributes: ['@default(false)'] },
    ],
    blockAttributes: ['@@index([tenantId])', '@@index([role])'],
  },
  {
    name: 'Credential',
    fields: [
      { name: 'username', type: 'String', attributes: ['@id'] },
      { name: 'passwordHash', type: 'String' },
    ],
  },
  {
    name: 'Session',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'userId', type: 'String' },
      { name: 'token', type: 'String', attributes: ['@unique'] },
      { name: 'expiresAt', type: 'BigInt' },
      { name: 'createdAt', type: 'BigInt' },
      { name: 'lastActivity', type: 'BigInt' },
      { name: 'ipAddress', type: 'String?' },
      { name: 'userAgent', type: 'String?' },
    ],
    blockAttributes: ['@@index([userId])', '@@index([expiresAt])', '@@index([token])'],
  },
  {
    name: 'PageConfig',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'tenantId', type: 'String?' },
      { name: 'packageId', type: 'String?' },
      { name: 'path', type: 'String', comment: '// Route pattern: /media/jobs, /forum/:id' },
      { name: 'title', type: 'String' },
      { name: 'description', type: 'String?' },
      { name: 'icon', type: 'String?' },
      { name: 'component', type: 'String?' },
      { name: 'componentTree', type: 'String', comment: '// JSON: full component tree' },
      { name: 'level', type: 'Int' },
      { name: 'requiresAuth', type: 'Boolean' },
      { name: 'requiredRole', type: 'String?' },
      { name: 'parentPath', type: 'String?' },
      { name: 'sortOrder', type: 'Int', attributes: ['@default(0)'] },
      { name: 'isPublished', type: 'Boolean', attributes: ['@default(true)'] },
      { name: 'params', type: 'String?' },
      { name: 'meta', type: 'String?' },
      { name: 'createdAt', type: 'BigInt?' },
      { name: 'updatedAt', type: 'BigInt?' },
    ],
    blockAttributes: [
      '@@unique([tenantId, path])',
      '@@index([tenantId])',
      '@@index([packageId])',
      '@@index([level])',
      '@@index([parentPath])',
    ],
  },
  {
    name: 'ComponentNode',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'type', type: 'String' },
      { name: 'parentId', type: 'String?' },
      { name: 'childIds', type: 'String', comment: '// JSON: string[]' },
      { name: 'order', type: 'Int' },
      { name: 'pageId', type: 'String' },
    ],
    blockAttributes: ['@@index([pageId])', '@@index([parentId])'],
  },
  {
    name: 'ComponentConfig',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'componentId', type: 'String' },
      { name: 'props', type: 'String', comment: '// JSON' },
      { name: 'styles', type: 'String', comment: '// JSON' },
      { name: 'events', type: 'String', comment: '// JSON' },
      { name: 'conditionalRendering', type: 'String?' },
    ],
    blockAttributes: ['@@index([componentId])'],
  },
  {
    name: 'Workflow',
    fields: [
      { name: 'id', type: 'String', attributes: ['@id'] },
      { name: 'tenantId', type: 'String?' },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String?' },
      { name: 'nodes', type: 'String', comment: '// JSON: WorkflowNode[]' },
      { name: 'edges', type: 'String', comment: '// JSON: WorkflowEdge[]' },
      { name: 'enabled', type: 'Boolean' },
      { name: 'version', type: 'Int', attributes: ['@default(1)'] },
      { name: 'createdAt', type: 'BigInt?' },
      { name: 'updatedAt', type: 'BigInt?' },
      { name: 'createdBy', type: 'String?' },
    ],
    blockAttributes: ['@@index([tenantId])', '@@index([enabled])'],
  },
  {
    name: 'InstalledPackage',
    fields: [
      { name: 'packageId', type: 'String', attributes: ['@id'] },
      { name: 'tenantId', type: 'String?' },
      { name: 'installedAt', type: 'BigInt' },
      { name: 'version', type: 'String' },
      { name: 'enabled', type: 'Boolean' },
      { name: 'config', type: 'String?' },
    ],
    blockAttributes: ['@@index([tenantId])'],
  },
  {
    name: 'PackageData',
    fields: [
      { name: 'packageId', type: 'String', attributes: ['@id'] },
      { name: 'data', type: 'String', comment: '// JSON' },
    ],
  },
]

const renderField = (field) => {
  const attrs = field.attributes ? ` ${field.attributes.join(' ')}` : ''
  const comment = field.comment ? ` ${field.comment}` : ''
  return `  ${field.name} ${field.type}${attrs}${comment}`
}

const renderModel = (model) => {
  const lines = [`model ${model.name} {`]
  model.fields.forEach((field) => {
    lines.push(renderField(field))
  })
  if (model.blockAttributes) {
    model.blockAttributes.forEach((attr) => {
      lines.push(`  ${attr}`)
    })
  }
  lines.push('}')
  return lines.join('\n')
}

const schema = [header, models.map(renderModel).join('\n\n')].join('\n\n')
const outputPath = path.resolve(__dirname, '../../../../prisma/schema.prisma')
fs.writeFileSync(outputPath, schema + '\n', 'utf8')
console.log(`Prisma schema written to ${outputPath}`)
