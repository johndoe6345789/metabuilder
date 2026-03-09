const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const definitionsPath = path.join(rootDir, 'src', 'lib', 'component-definitions.json')
const schemaDirs = [
  path.join(rootDir, 'src', 'schemas'),
  path.join(rootDir, 'public', 'schemas'),
]

const commonProps = new Set(['className', 'style', 'children'])
const bindingSourceTypes = new Set(['data', 'bindings', 'state'])

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const fileExists = (filePath) => fs.existsSync(filePath)

const componentDefinitions = readJson(definitionsPath)
const definitionsByType = new Map(
  componentDefinitions
    .filter((definition) => definition.type)
    .map((definition) => [definition.type, definition])
)

const errors = []

const reportError = (file, pathLabel, message) => {
  errors.push({ file, path: pathLabel, message })
}

const collectSchemaFiles = (dirs) => {
  const files = []
  dirs.forEach((dir) => {
    if (!fileExists(dir)) return
    fs.readdirSync(dir).forEach((entry) => {
      if (!entry.endsWith('.json')) return
      files.push(path.join(dir, entry))
    })
  })
  return files
}

const isPageSchema = (schema) =>
  schema
  && typeof schema === 'object'
  && schema.layout
  && Array.isArray(schema.components)

const extractSchemas = (data, filePath) => {
  if (isPageSchema(data)) {
    return [{ name: filePath, schema: data }]
  }

  if (data && typeof data === 'object') {
    const schemas = Object.entries(data)
      .filter(([, value]) => isPageSchema(value))
      .map(([key, value]) => ({ name: `${filePath}:${key}`, schema: value }))
    if (schemas.length > 0) {
      return schemas
    }
  }

  return []
}

const validateBindings = (bindings, fileLabel, pathLabel, contextVars, dataSourceIds, definition) => {
  if (!bindings) return

  const propDefinitions = definition?.props
    ? new Map(definition.props.map((prop) => [prop.name, prop]))
    : null

  Object.entries(bindings).forEach(([propName, binding]) => {
    if (propDefinitions) {
      if (!propDefinitions.has(propName) && !commonProps.has(propName)) {
        reportError(fileLabel, `${pathLabel}.bindings.${propName}`, `Invalid binding for unknown prop "${propName}"`)
        return
      }

      const propDefinition = propDefinitions.get(propName)
      if (propDefinition && propDefinition.supportsBinding !== true) {
        reportError(fileLabel, `${pathLabel}.bindings.${propName}`, `Binding not supported for prop "${propName}"`)
      }
    }

    if (binding && typeof binding === 'object') {
      const sourceType = binding.sourceType ?? 'data'
      if (!bindingSourceTypes.has(sourceType)) {
        reportError(
          fileLabel,
          `${pathLabel}.bindings.${propName}.sourceType`,
          `Unsupported binding sourceType "${sourceType}"`
        )
      }

      const source = binding.source
      if (source && sourceType !== 'state') {
        const isKnownSource = dataSourceIds.has(source) || contextVars.has(source)
        if (!isKnownSource) {
          reportError(
            fileLabel,
            `${pathLabel}.bindings.${propName}.source`,
            `Binding source "${source}" is not defined in dataSources or loop context`
          )
        }
      }
    }
  })
}

const validateDataBinding = (dataBinding, fileLabel, pathLabel, contextVars, dataSourceIds) => {
  if (!dataBinding || typeof dataBinding !== 'object') return

  const sourceType = dataBinding.sourceType ?? 'data'
  if (!bindingSourceTypes.has(sourceType)) {
    reportError(
      fileLabel,
      `${pathLabel}.dataBinding.sourceType`,
      `Unsupported dataBinding sourceType "${sourceType}"`
    )
  }

  if (dataBinding.source && sourceType !== 'state') {
    const isKnownSource = dataSourceIds.has(dataBinding.source) || contextVars.has(dataBinding.source)
    if (!isKnownSource) {
      reportError(
        fileLabel,
        `${pathLabel}.dataBinding.source`,
        `Data binding source "${dataBinding.source}" is not defined in dataSources or loop context`
      )
    }
  }
}

const validateRequiredProps = (component, fileLabel, pathLabel, definition, bindings) => {
  if (!definition?.props) return

  definition.props.forEach((prop) => {
    if (!prop.required) return

    const hasProp = component.props && Object.prototype.hasOwnProperty.call(component.props, prop.name)
    const hasBinding = bindings && Object.prototype.hasOwnProperty.call(bindings, prop.name)

    if (!hasProp && (!prop.supportsBinding || !hasBinding)) {
      reportError(
        fileLabel,
        `${pathLabel}.props.${prop.name}`,
        `Missing required prop "${prop.name}" for component type "${component.type}"`
      )
    }
  })
}

const validateProps = (component, fileLabel, pathLabel, definition) => {
  if (!component.props || !definition?.props) return

  const allowedProps = new Set(definition.props.map((prop) => prop.name))
  commonProps.forEach((prop) => allowedProps.add(prop))

  Object.keys(component.props).forEach((propName) => {
    if (!allowedProps.has(propName)) {
      reportError(
        fileLabel,
        `${pathLabel}.props.${propName}`,
        `Invalid prop "${propName}" for component type "${component.type}"`
      )
    }
  })
}

const lintComponent = (component, fileLabel, pathLabel, contextVars, dataSourceIds) => {
  if (!component || typeof component !== 'object') return

  if (!component.id) {
    reportError(fileLabel, pathLabel, 'Missing required component id')
  }

  if (!component.type) {
    reportError(fileLabel, pathLabel, 'Missing required component type')
    return
  }

  const definition = definitionsByType.get(component.type)

  validateProps(component, fileLabel, pathLabel, definition)
  validateRequiredProps(component, fileLabel, pathLabel, definition, component.bindings)
  validateBindings(component.bindings, fileLabel, pathLabel, contextVars, dataSourceIds, definition)
  validateDataBinding(component.dataBinding, fileLabel, pathLabel, contextVars, dataSourceIds)

  const nextContextVars = new Set(contextVars)
  const repeatConfig = component.loop ?? component.repeat
  if (repeatConfig) {
    if (repeatConfig.itemVar) {
      nextContextVars.add(repeatConfig.itemVar)
    }
    if (repeatConfig.indexVar) {
      nextContextVars.add(repeatConfig.indexVar)
    }
  }

  if (Array.isArray(component.children)) {
    component.children.forEach((child, index) => {
      if (typeof child === 'string') return
      lintComponent(child, fileLabel, `${pathLabel}.children[${index}]`, nextContextVars, dataSourceIds)
    })
  }

  if (component.conditional) {
    const branches = [component.conditional.then, component.conditional.else]
    branches.forEach((branch, branchIndex) => {
      if (!branch) return
      if (typeof branch === 'string') return
      if (Array.isArray(branch)) {
        branch.forEach((child, index) => {
          if (typeof child === 'string') return
          lintComponent(child, fileLabel, `${pathLabel}.conditional.${branchIndex}[${index}]`, nextContextVars, dataSourceIds)
        })
      } else {
        lintComponent(branch, fileLabel, `${pathLabel}.conditional.${branchIndex}`, nextContextVars, dataSourceIds)
      }
    })
  }
}

const lintSchema = (schema, fileLabel) => {
  const dataSourceIds = new Set(
    Array.isArray(schema.dataSources)
      ? schema.dataSources.map((source) => source.id).filter(Boolean)
      : []
  )

  schema.components.forEach((component, index) => {
    lintComponent(component, fileLabel, `components[${index}]`, new Set(), dataSourceIds)
  })
}

const schemaFiles = collectSchemaFiles(schemaDirs)

schemaFiles.forEach((filePath) => {
  const data = readJson(filePath)
  const schemas = extractSchemas(data, filePath)
  schemas.forEach(({ name, schema }) => lintSchema(schema, name))
})

if (errors.length > 0) {
  console.error('JSON UI lint errors found:')
  errors.forEach((error) => {
    console.error(`- ${error.file} :: ${error.path} :: ${error.message}`)
  })
  process.exit(1)
}

console.log('JSON UI lint passed.')
