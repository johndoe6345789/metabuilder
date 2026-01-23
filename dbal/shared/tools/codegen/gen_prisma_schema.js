#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const header = `datasource db {
  provider = "sqlite"
}

generator client {
  provider = "prisma-client-js"
}`

// Hardcoded core models
const coreModels = [
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

// Function to convert YAML field type to Prisma type
function yamlTypeToPrismaType(yamlType, isNullable = false, isArray = false) {
  const typeMap = {
    cuid: 'String',
    uuid: 'String',
    string: 'String',
    int: 'Int',
    bigint: 'BigInt',
    float: 'Float',
    boolean: 'Boolean',
    json: 'String', // JSON stored as string in SQLite
    text: 'String',
    enum: 'String',
  }

  let prismaType = typeMap[yamlType] || 'String'
  if (isArray) prismaType = prismaType + '[]'
  if (isNullable) prismaType = prismaType + '?'

  return prismaType
}

// Function to load and convert YAML schema to model
function yamlToModel(yamlPath) {
  try {
    const content = fs.readFileSync(yamlPath, 'utf8')
    const yamlData = yaml.parse(content)

    if (!yamlData || !yamlData.entity) {
      return null
    }

    const modelName = yamlData.entity
    const fields = []
    const blockAttributes = []

    // Process fields
    if (yamlData.fields && typeof yamlData.fields === 'object') {
      for (const [fieldName, fieldDef] of Object.entries(yamlData.fields)) {
        if (!fieldDef || typeof fieldDef !== 'object') continue

        const isNullable = fieldDef.nullable || !fieldDef.required
        const fieldType = yamlTypeToPrismaType(fieldDef.type, isNullable)
        const attributes = []

        // Handle primary key
        if (fieldDef.primary) {
          attributes.push('@id')
        }

        // Handle unique constraint
        if (fieldDef.unique) {
          attributes.push('@unique')
        }

        // Handle default values
        if (fieldDef.default !== undefined) {
          let defaultVal = fieldDef.default
          if (typeof defaultVal === 'string') {
            defaultVal = `"${defaultVal}"`
          }
          attributes.push(`@default(${defaultVal})`)
        }

        // Handle generated fields
        if (fieldDef.generated) {
          if (fieldName === 'id' && fieldDef.type === 'cuid') {
            attributes.push('@default(cuid())')
          }
        }

        fields.push({
          name: fieldName,
          type: fieldType,
          attributes: attributes.length > 0 ? attributes : undefined,
        })
      }
    }

    // Process indexes
    if (Array.isArray(yamlData.indexes)) {
      yamlData.indexes.forEach((index) => {
        if (index.fields && Array.isArray(index.fields)) {
          const fieldList = index.fields.join(', ')
          blockAttributes.push(`@@index([${fieldList}])`)
        }
      })
    }

    return {
      name: modelName,
      fields,
      blockAttributes: blockAttributes.length > 0 ? blockAttributes : undefined,
    }
  } catch (err) {
    return null
  }
}

// Load all YAML entity schemas
function loadYamlModels(entityDir) {
  const models = []

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir)
      files.forEach((file) => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (file.endsWith('.yaml')) {
          const model = yamlToModel(fullPath)
          if (model) {
            models.push(model)
          }
        }
      })
    } catch (err) {
      // Ignore directory read errors
    }
  }

  walkDir(entityDir)
  return models
}

const entityDir = path.resolve(__dirname, '../../api/schema/entities')
const yamlModels = loadYamlModels(entityDir)

console.log(`✓ Parsed ${coreModels.length} existing entities`)
console.log(`✓ Parsed ${yamlModels.length} YAML email entities`)
yamlModels.forEach((m) => console.log(`  - ${m.name}`))

const models = [...coreModels, ...yamlModels]

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
const outputPath = path.resolve(__dirname, '../../prisma/schema.prisma')
fs.writeFileSync(outputPath, schema + '\n', 'utf8')
console.log(`Prisma schema written to ${outputPath}`)
