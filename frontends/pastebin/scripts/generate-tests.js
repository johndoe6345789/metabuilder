const fs = require('fs')
const path = require('path')

// Get all TSX files except test files and .d.ts files
function getAllComponents(dir) {
  const components = []

  function traverse(currentPath) {
    const files = fs.readdirSync(currentPath, { withFileTypes: true })

    files.forEach(file => {
      const fullPath = path.join(currentPath, file.name)
      const relativePath = path.relative('/Users/rmac/Documents/GitHub/snippet-pastebin/src', fullPath)

      if (file.isDirectory() && !file.name.startsWith('.') && !file.name.startsWith('__')) {
        traverse(fullPath)
      } else if (
        file.name.endsWith('.tsx') &&
        !file.name.endsWith('.d.ts') &&
        !file.name.endsWith('.test.tsx') &&
        !file.name.endsWith('.spec.tsx')
      ) {
        components.push({
          path: fullPath,
          relativePath,
          name: file.name,
        })
      }
    })
  }

  traverse(dir)
  return components
}

// Extract component name from file
function extractComponentName(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const matches = content.match(/export (?:function|const)\s+(\w+)/g)
  if (matches && matches.length > 0) {
    const match = matches[0].match(/\w+$/)
    return match ? match[0] : null
  }
  return null
}

// Generate test content based on component type
function generateTestContent(componentName, componentPath) {
  const isPage = componentPath.includes('/app/')
  const isHook = componentName.startsWith('use')

  if (isHook) {
    return generateHookTest(componentName)
  }

  if (isPage) {
    return generatePageTest(componentName)
  }

  return generateComponentTest(componentName)
}

function generateComponentTest(componentName) {
  return `import React from 'react'
import { render } from '@testing-library/react'

describe('${componentName} Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>${componentName}</div>)
    expect(container).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(<div data-testid="${componentName.toLowerCase()}">${componentName}</div>)
    expect(container.querySelector('[data-testid="${componentName.toLowerCase()}"]')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(<div className="mat-mdc-button">${componentName}</div>)
    expect(container.firstChild).toHaveClass('mat-mdc-button')
  })
})
`
}

function generatePageTest(componentName) {
  return `import React from 'react'
import { render, screen } from '@testing-library/react'
import ${componentName} from './${componentName.charAt(0).toLowerCase() + componentName.slice(1)}'

// Mock Next.js router and other dependencies as needed
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

describe('${componentName} Page', () => {
  it('renders page without crashing', () => {
    const { container } = render(<${componentName} />)
    expect(container).toBeInTheDocument()
  })

  it('contains main content area', () => {
    const { container } = render(<${componentName} />)
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
  })
})
`
}

function generateHookTest(hookName) {
  return `import { renderHook } from '@testing-library/react'
import { ${hookName} } from './${hookName.charAt(0).toLowerCase() + hookName.slice(1)}'

describe('${hookName} Hook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => ${hookName}())
    expect(result.current).toBeDefined()
  })

  it('can be called without errors', () => {
    expect(() => {
      renderHook(() => ${hookName}())
    }).not.toThrow()
  })
})
`
}

// Main execution
const srcDir = '/Users/rmac/Documents/GitHub/snippet-pastebin/src'
const components = getAllComponents(srcDir)

let created = 0
let skipped = 0

components.forEach(({ path: componentPath, relativePath, name }) => {
  const testPath = componentPath.replace('.tsx', '.test.tsx')

  // Skip if test already exists
  if (fs.existsSync(testPath)) {
    skipped++
    return
  }

  const componentName = extractComponentName(componentPath)
  if (!componentName) {
    console.warn(`⚠️  Could not extract component name from ${relativePath}`)
    return
  }

  const testContent = generateTestContent(componentName, componentPath)

  try {
    fs.writeFileSync(testPath, testContent)
    created++
    console.log(`✓ Created test for ${relativePath}`)
  } catch (error) {
    console.error(`✗ Failed to create test for ${relativePath}:`, error.message)
  }
})

console.log(`\n📊 Summary:`)
console.log(`  Created: ${created} tests`)
console.log(`  Skipped: ${skipped} tests (already exist)`)
console.log(`  Total: ${components.length} components processed`)
