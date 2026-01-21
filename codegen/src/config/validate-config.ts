import pagesConfig from './pages.json'
import { PageConfig } from './page-loader'

export interface ValidationError {
  page: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export function validatePageConfig(): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()
  const seenShortcuts = new Set<string>()
  const seenOrders = new Set<number>()
  
  const validStateKeys = [
    'files', 'models', 'components', 'componentTrees', 'workflows',
    'lambdas', 'theme', 'playwrightTests', 'storybookStories',
    'unitTests', 'flaskConfig', 'nextjsConfig', 'npmSettings',
    'featureToggles', 'activeFileId'
  ]
  
  const validActionKeys = [
    'handleFileChange', 'setActiveFileId', 'handleFileClose', 'handleFileAdd',
    'setModels', 'setComponents', 'setComponentTrees', 'setWorkflows',
    'setLambdas', 'setTheme', 'setPlaywrightTests', 'setStorybookStories',
    'setUnitTests', 'setFlaskConfig', 'setNextjsConfig', 'setNpmSettings',
    'setFeatureToggles'
  ]

  pagesConfig.pages.forEach((page: PageConfig) => {
    if (!page.id) {
      errors.push({
        page: page.title || 'Unknown',
        field: 'id',
        message: 'Page ID is required',
        severity: 'error',
      })
    } else if (seenIds.has(page.id)) {
      errors.push({
        page: page.id,
        field: 'id',
        message: `Duplicate page ID: ${page.id}`,
        severity: 'error',
      })
    } else {
      seenIds.add(page.id)
    }

    if (!page.title) {
      errors.push({
        page: page.id || 'Unknown',
        field: 'title',
        message: 'Page title is required',
        severity: 'error',
      })
    }

    const isJsonPage = page.type === 'json' || Boolean(page.schemaPath)

    if (!page.component && !isJsonPage) {
      errors.push({
        page: page.id || 'Unknown',
        field: 'component',
        message: 'Component name is required',
        severity: 'error',
      })
    }

    if (isJsonPage && !page.schemaPath && !page.schema) {
      errors.push({
        page: page.id || 'Unknown',
        field: 'schemaPath',
        message: 'schemaPath is required for JSON pages',
        severity: 'error',
      })
    }

    if (!page.icon) {
      errors.push({
        page: page.id || 'Unknown',
        field: 'icon',
        message: 'Icon is required',
        severity: 'warning',
      })
    }

    if (page.shortcut) {
      if (seenShortcuts.has(page.shortcut)) {
        errors.push({
          page: page.id || 'Unknown',
          field: 'shortcut',
          message: `Duplicate shortcut: ${page.shortcut}`,
          severity: 'warning',
        })
      } else {
        seenShortcuts.add(page.shortcut)
      }

      const validShortcutPattern = /^(ctrl\+)?(shift\+)?(alt\+)?[a-z0-9]$/i
      if (!validShortcutPattern.test(page.shortcut)) {
        errors.push({
          page: page.id || 'Unknown',
          field: 'shortcut',
          message: `Invalid shortcut format: ${page.shortcut}. Use format like "ctrl+1" or "ctrl+shift+e"`,
          severity: 'error',
        })
      }
    }

    if (page.order !== undefined) {
      if (seenOrders.has(page.order)) {
        errors.push({
          page: page.id || 'Unknown',
          field: 'order',
          message: `Duplicate order number: ${page.order}`,
          severity: 'warning',
        })
      } else {
        seenOrders.add(page.order)
      }
    }

    if (page.toggleKey) {
      const validToggleKeys = [
        'codeEditor',
        'models',
        'components',
        'componentTrees',
        'workflows',
        'lambdas',
        'styling',
        'flaskApi',
        'playwright',
        'storybook',
        'unitTests',
        'errorRepair',
        'documentation',
        'sassStyles',
        'faviconDesigner',
        'ideaCloud',
      ]
      
      if (!validToggleKeys.includes(page.toggleKey)) {
        errors.push({
          page: page.id || 'Unknown',
          field: 'toggleKey',
          message: `Unknown toggle key: ${page.toggleKey}. Must match a key in FeatureToggles type.`,
          severity: 'error',
        })
      }
    }
    
    if (page.props) {
      const validateStateKeys = (keys: string[] | undefined, field: string) => {
        if (!keys) return
        keys.forEach(stateKey => {
          const [, contextKey] = stateKey.includes(':')
            ? stateKey.split(':')
            : [stateKey, stateKey]

          if (!validStateKeys.includes(contextKey)) {
            errors.push({
              page: page.id || 'Unknown',
              field,
              message: `Unknown state key: ${contextKey}. Valid keys: ${validStateKeys.join(', ')}`,
              severity: 'error',
            })
          }
        })
      }

      const validateActionKeys = (keys: string[] | undefined, field: string) => {
        if (!keys) return
        keys.forEach(actionKey => {
          const [, contextKey] = actionKey.includes(':')
            ? actionKey.split(':')
            : [actionKey, actionKey]

          if (!contextKey) {
            errors.push({
              page: page.id || 'Unknown',
              field,
              message: `Action key must use format "propName:functionName". Got: ${actionKey}`,
              severity: 'error',
            })
          } else if (!validActionKeys.includes(contextKey)) {
            errors.push({
              page: page.id || 'Unknown',
              field,
              message: `Unknown action key: ${contextKey}. Valid keys: ${validActionKeys.join(', ')}`,
              severity: 'error',
            })
          }
        })
      }

      validateStateKeys(page.props.state, 'props.state')
      validateActionKeys(page.props.actions, 'props.actions')
      validateStateKeys(page.props.data, 'props.data')
      validateActionKeys(page.props.functions, 'props.functions')
    }
    
    if (page.requiresResizable) {
      if (!page.resizableConfig) {
        errors.push({
          page: page.id || 'Unknown',
          field: 'resizableConfig',
          message: 'resizableConfig is required when requiresResizable is true',
          severity: 'error',
        })
      } else {
        if (!page.resizableConfig.leftComponent) {
          errors.push({
            page: page.id || 'Unknown',
            field: 'resizableConfig.leftComponent',
            message: 'leftComponent is required in resizableConfig',
            severity: 'error',
          })
        }
        
        const leftPanel = page.resizableConfig.leftPanel
        const rightPanel = page.resizableConfig.rightPanel
        
        if (leftPanel && rightPanel) {
          const totalSize = leftPanel.defaultSize + rightPanel.defaultSize
          if (totalSize !== 100) {
            errors.push({
              page: page.id || 'Unknown',
              field: 'resizableConfig',
              message: `Panel defaultSize values must sum to 100. Got: ${totalSize}`,
              severity: 'warning',
            })
          }
        }
      }
    }
  })

  return errors
}

export function printValidationErrors(errors: ValidationError[]) {
  if (errors.length === 0) {
    console.log('✅ Page configuration is valid!')
    return
  }

  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length

  console.log('\n📋 Page Configuration Validation Results\n')
  
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`)
    errors
      .filter(e => e.severity === 'error')
      .forEach(e => {
        console.log(`  • [${e.page}] ${e.field}: ${e.message}`)
      })
  }

  if (warningCount > 0) {
    console.log(`\n⚠️  Warnings: ${warningCount}`)
    errors
      .filter(e => e.severity === 'warning')
      .forEach(e => {
        console.log(`  • [${e.page}] ${e.field}: ${e.message}`)
      })
  }

  console.log('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validatePageConfig()
  printValidationErrors(errors)
  process.exit(errors.filter(e => e.severity === 'error').length > 0 ? 1 : 0)
}
