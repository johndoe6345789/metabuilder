import { lazy } from 'react'
import { lazyWithRetry, lazyWithPreload } from '@/lib/lazy-loader'
import componentRegistryConfig from '../../component-registry.json'

type ComponentConfig = {
  name: string
  path: string
  export: string
  type: string
  preload?: boolean
  preloadPriority?: 'high' | 'medium' | 'low'
  category?: string
  dependencies?: string[]
  preloadDependencies?: string[]
  experimental?: boolean
  description?: string
}

type RegistryConfig = {
  version: string
  components: ComponentConfig[]
  dialogs: ComponentConfig[]
  pwa: ComponentConfig[]
  preloadStrategy: {
    critical: string[]
    onDemand: string
    preloadDelay: number
  }
}

const config = componentRegistryConfig as RegistryConfig

// Monaco editor preloader - inlined
const preloadMonacoEditor = () => {
  console.log('[MONACO] 🎯 Preloading Monaco Editor')
  import('@monaco-editor/react')
    .then(() => console.log('[MONACO] ✅ Monaco Editor preloaded'))
    .catch(err => console.warn('[MONACO] ⚠️ Monaco Editor preload failed:', err))
}

const dependencyPreloaders: Record<string, () => void> = {
  preloadMonacoEditor
}

function createLazyComponent(componentConfig: ComponentConfig) {
  const loader = async () => {
    if (componentConfig.preloadDependencies) {
      componentConfig.preloadDependencies.forEach(depName => {
        const preloader = dependencyPreloaders[depName]
        if (preloader) {
          preloader()
        }
      })
    }
    
    const pathVariants = generatePathVariants(componentConfig.path, componentConfig.name)
    
    let lastError: Error | null = null
    for (const path of pathVariants) {
      try {
        const module = await import(/* @vite-ignore */ path)
        const exportName = componentConfig.export || 'default'
        
        if (module[exportName]) {
          return { default: module[exportName] }
        }
        
        if (exportName === 'default' && module.default) {
          return { default: module.default }
        }
        
        if (module[componentConfig.name]) {
          return { default: module[componentConfig.name] }
        }
        
        const firstExport = Object.keys(module).find(key => 
          key !== '__esModule' && 
          key !== 'default' && 
          typeof module[key] === 'function'
        )
        
        if (firstExport) {
          return { default: module[firstExport] }
        }
        
        if (module.default) {
          return { default: module.default }
        }
        
        return { default: module }
      } catch (err) {
        lastError = err as Error
        continue
      }
    }
    
    console.error(`[REGISTRY] ❌ Failed to load component "${componentConfig.name}" after trying ${pathVariants.length} path variants`)
    throw lastError || new Error(`Failed to load component: ${componentConfig.name}`)
  }

  if (componentConfig.type === 'dialog' || componentConfig.type === 'pwa') {
    return lazy(loader)
  }

  return lazyWithPreload(loader, componentConfig.name)
}

function generatePathVariants(path: string, componentName: string): string[] {
  const variants: string[] = []
  
  const cleanPath = path.replace(/\.tsx?$/, '')
  
  variants.push(path)
  
  if (!path.endsWith('.tsx') && !path.endsWith('.ts')) {
    variants.push(`${cleanPath}.tsx`)
    variants.push(`${cleanPath}.ts`)
  }
  
  if (path.startsWith('@/components/')) {
    const relativePath = path.replace('@/components/', '')
    variants.push(`/src/components/${relativePath}`)
    variants.push(`/src/components/${relativePath}.tsx`)
    variants.push(`/src/components/${relativePath}.ts`)
    variants.push(`./components/${relativePath}`)
    variants.push(`./components/${relativePath}.tsx`)
    variants.push(`../components/${relativePath}`)
    variants.push(`../components/${relativePath}.tsx`)
  }
  
  if (path.startsWith('@/')) {
    const relativePath = path.replace('@/', '')
    variants.push(`/src/${relativePath}`)
    variants.push(`/src/${relativePath}.tsx`)
    variants.push(`/src/${relativePath}.ts`)
    variants.push(`./${relativePath}`)
    variants.push(`./${relativePath}.tsx`)
    variants.push(`../${relativePath}`)
    variants.push(`../${relativePath}.tsx`)
  }
  
  if (!path.startsWith('@/') && !path.startsWith('/') && !path.startsWith('./') && !path.startsWith('../')) {
    variants.push(`@/${path}`)
    variants.push(`@/${path}.tsx`)
    variants.push(`@/components/${path}`)
    variants.push(`@/components/${path}.tsx`)
    variants.push(`/src/${path}`)
    variants.push(`/src/${path}.tsx`)
    variants.push(`/src/components/${path}`)
    variants.push(`/src/components/${path}.tsx`)
  }
  
  if (path.endsWith('.tsx')) {
    variants.push(path.replace('.tsx', ''))
  }
  
  const pathWithoutExt = cleanPath
  const lastSegment = pathWithoutExt.split('/').pop() || ''
  
  if (lastSegment !== componentName) {
    const dirPath = pathWithoutExt.substring(0, pathWithoutExt.lastIndexOf('/'))
    if (dirPath) {
      variants.push(`${dirPath}/${componentName}`)
      variants.push(`${dirPath}/${componentName}.tsx`)
      variants.push(`${dirPath}/${componentName}.ts`)
      variants.push(`${dirPath}/index.tsx`)
      variants.push(`${dirPath}/index.ts`)
    }
  }
  
  const seen = new Set<string>()
  return variants.filter(v => {
    if (seen.has(v)) return false
    seen.add(v)
    return true
  })
}

function buildRegistry(components: ComponentConfig[]) {
  return components.reduce((registry, component) => {
    registry[component.name] = createLazyComponent(component)
    return registry
  }, {} as Record<string, any>)
}

export const ComponentRegistry = buildRegistry(config.components) as Record<string, ReturnType<typeof lazyWithPreload>>
export const DialogRegistry = buildRegistry(config.dialogs) as Record<string, ReturnType<typeof lazy>>
export const PWARegistry = buildRegistry(config.pwa) as Record<string, ReturnType<typeof lazy>>

export function preloadCriticalComponents() {
  console.log('[REGISTRY] 🚀 Preloading critical components')
  
  const criticalComponents = config.preloadStrategy.critical
  
  criticalComponents.forEach(componentName => {
    const component = ComponentRegistry[componentName]
    if (component && 'preload' in component && typeof component.preload === 'function') {
      component.preload()
    }
  })
  
  console.log('[REGISTRY] ✅ Critical components preload initiated')
}

export function preloadComponentByName(name: string) {
  console.log(`[REGISTRY] 🎯 Preloading component: ${name}`)
  const component = ComponentRegistry[name]
  if (component && 'preload' in component && typeof component.preload === 'function') {
    component.preload()
    console.log(`[REGISTRY] ✅ Preload initiated for: ${name}`)
  } else {
    console.warn(`[REGISTRY] ⚠️ Component ${name} does not support preloading`)
  }
}

export function getComponentMetadata(name: string): ComponentConfig | undefined {
  return [...config.components, ...config.dialogs, ...config.pwa].find(c => c.name === name)
}

export function getComponentsByCategory(category: string): ComponentConfig[] {
  return config.components.filter(c => c.category === category)
}

export function getAllCategories(): string[] {
  const categories = new Set(config.components.map(c => c.category).filter(Boolean))
  return Array.from(categories) as string[]
}

export type ComponentName = keyof typeof ComponentRegistry
export type DialogName = keyof typeof DialogRegistry
export type PWAComponentName = keyof typeof PWARegistry
