#!/usr/bin/env node

/**
 * Scan and Update JSON Components Registry
 * 
 * Scans the actual component files in src/components and updates
 * json-components-registry.json to include all real components.
 * 
 * Usage:
 *   node scripts/scan-and-update-registry.cjs
 */

const fs = require('fs')
const path = require('path')

// Scan a directory for .tsx files
function scanComponents(dir) {
  const files = fs.readdirSync(dir)
  return files
    .filter(f => f.endsWith('.tsx') && !f.startsWith('index'))
    .map(f => f.replace('.tsx', ''))
}

// Get all components
const atomsPath = path.join(process.cwd(), 'src/components/atoms')
const moleculesPath = path.join(process.cwd(), 'src/components/molecules')
const organismsPath = path.join(process.cwd(), 'src/components/organisms')
const uiPath = path.join(process.cwd(), 'src/components/ui')

const atoms = scanComponents(atomsPath)
const molecules = scanComponents(moleculesPath)
const organisms = fs.existsSync(organismsPath) ? scanComponents(organismsPath) : []
const ui = scanComponents(uiPath)

console.log(`Found ${atoms.length} atoms, ${molecules.length} molecules, ${organisms.length} organisms, ${ui.length} ui components`)
console.log(`Total: ${atoms.length + molecules.length + organisms.length + ui.length} components`)

// Read existing registry to preserve metadata
const registryPath = path.join(process.cwd(), 'json-components-registry.json')
let existingRegistry = { components: [] }
if (fs.existsSync(registryPath)) {
  existingRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
}

// Create a map of existing components for quick lookup
const existingMap = new Map()
existingRegistry.components.forEach(c => {
  existingMap.set(c.type, c)
})

// Category mapping heuristics
function guessCategory(name) {
  const lower = name.toLowerCase()
  
  // Layout
  if (lower.includes('container') || lower.includes('grid') || lower.includes('flex') || 
      lower.includes('stack') || lower.includes('card') || lower.includes('section') ||
      lower.includes('drawer') || lower.includes('modal') || lower.includes('dialog')) {
    return 'layout'
  }
  
  // Input
  if (lower.includes('input') || lower.includes('button') || lower.includes('select') ||
      lower.includes('checkbox') || lower.includes('radio') || lower.includes('switch') ||
      lower.includes('slider') || lower.includes('form') || lower.includes('upload') ||
      lower.includes('picker') || lower.includes('toggle')) {
    return 'input'
  }
  
  // Navigation
  if (lower.includes('link') || lower.includes('breadcrumb') || lower.includes('tab') ||
      lower.includes('menu') || lower.includes('navigation')) {
    return 'navigation'
  }
  
  // Feedback
  if (lower.includes('alert') || lower.includes('notification') || lower.includes('badge') ||
      lower.includes('status') || lower.includes('error') || lower.includes('empty') ||
      lower.includes('loading') || lower.includes('spinner') || lower.includes('toast')) {
    return 'feedback'
  }
  
  // Data
  if (lower.includes('table') || lower.includes('list') || lower.includes('data') ||
      lower.includes('metric') || lower.includes('stat') || lower.includes('chart') ||
      lower.includes('timeline') || lower.includes('keyvalue')) {
    return 'data'
  }
  
  // Display (default for text, images, icons, etc.)
  if (lower.includes('text') || lower.includes('heading') || lower.includes('label') ||
      lower.includes('image') || lower.includes('avatar') || lower.includes('icon') ||
      lower.includes('code') || lower.includes('tag') || lower.includes('skeleton') ||
      lower.includes('separator') || lower.includes('divider') || lower.includes('progress')) {
    return 'display'
  }
  
  return 'custom'
}

function canHaveChildren(name) {
  const noChildren = [
    'Input', 'TextArea', 'Select', 'Checkbox', 'Radio', 'Switch', 'Slider', 'NumberInput',
    'Image', 'Avatar', 'Separator', 'Divider', 'Progress', 'ProgressBar', 'Skeleton',
    'Spinner', 'Icon', 'FileUpload', 'DatePicker', 'CircularProgress', 'StatusIcon',
    'StatusBadge', 'ErrorBadge', 'Table', 'DataTable', 'List', 'DataList', 'KeyValue',
    'StatCard', 'MetricCard', 'DataCard', 'SearchInput', 'ActionBar', 'Timeline'
  ]
  return !noChildren.includes(name)
}

function getDescription(name) {
  // Try to generate a reasonable description
  const descriptions = {
    // Common patterns
    'Accordion': 'Collapsible content sections',
    'ActionButton': 'Button with action icon',
    'ActionBar': 'Action button toolbar',
    'Alert': 'Alert notification message',
    'Avatar': 'User avatar image',
    'AvatarGroup': 'Group of user avatars',
    'Badge': 'Small status or count indicator',
    'Breadcrumb': 'Navigation breadcrumb trail',
    'Button': 'Interactive button element',
    'ButtonGroup': 'Group of related buttons',
    'Calendar': 'Calendar date selector',
    'Card': 'Container card component',
    'Checkbox': 'Checkbox toggle control',
    'Chip': 'Compact element for tags or selections',
    'CircularProgress': 'Circular progress indicator',
    'Code': 'Inline or block code display',
    'CommandPalette': 'Command search and execution',
    'Container': 'Generic container element',
    'ContextMenu': 'Right-click context menu',
    'DataCard': 'Custom data display card',
    'DataList': 'Styled data list',
    'DataTable': 'Advanced data table with sorting and filtering',
    'DatePicker': 'Date selection input',
    'Divider': 'Visual section divider',
    'Drawer': 'Sliding panel overlay',
    'EmptyState': 'Empty state placeholder',
    'ErrorBadge': 'Error state badge',
    'FileUpload': 'File upload control',
    'Flex': 'Flexible box layout container',
    'Form': 'Form container component',
    'Grid': 'Responsive grid layout',
    'Heading': 'Heading text with level (h1-h6)',
    'HoverCard': 'Card shown on hover',
    'Icon': 'Icon from icon library',
    'IconButton': 'Button with icon only',
    'Image': 'Image element with loading states',
    'InfoBox': 'Information box with icon',
    'Input': 'Text input field',
    'Kbd': 'Keyboard key display',
    'KeyValue': 'Key-value pair display',
    'Label': 'Form label element',
    'Link': 'Hyperlink element',
    'List': 'Generic list renderer with custom items',
    'Menu': 'Menu component',
    'MetricCard': 'Metric display card',
    'Modal': 'Modal dialog overlay',
    'Notification': 'Toast notification',
    'NumberInput': 'Numeric input with increment/decrement',
    'PasswordInput': 'Password input with visibility toggle',
    'Popover': 'Popover overlay content',
    'Progress': 'Progress bar indicator',
    'ProgressBar': 'Linear progress bar',
    'Radio': 'Radio button selection',
    'Rating': 'Star rating component',
    'ScrollArea': 'Scrollable container area',
    'SearchInput': 'Search input with icon',
    'Select': 'Dropdown select control',
    'Separator': 'Visual divider line',
    'Skeleton': 'Loading skeleton placeholder',
    'Slider': 'Numeric range slider',
    'Spinner': 'Loading spinner',
    'Stack': 'Vertical or horizontal stack layout',
    'StatCard': 'Statistic card display',
    'StatusBadge': 'Status indicator badge',
    'StatusIcon': 'Status indicator icon',
    'Stepper': 'Step-by-step navigation',
    'Switch': 'Toggle switch control',
    'Table': 'Data table',
    'Tabs': 'Tabbed interface container',
    'Tag': 'Removable tag or chip',
    'Text': 'Text content with typography variants',
    'TextArea': 'Multi-line text input',
    'Timeline': 'Timeline visualization',
    'Toggle': 'Toggle button control',
    'Tooltip': 'Tooltip overlay text'
  }
  
  return descriptions[name] || `${name} component`
}

// JSON compatibility lists based on analysis
const jsonCompatibleMolecules = [
  'AppBranding', 'Breadcrumb', 'EmptyEditorState', 'LabelWithBadge',
  'LazyBarChart', 'LazyD3BarChart', 'LazyLineChart', 'LoadingFallback',
  'LoadingState', 'NavigationGroupHeader', 'SaveIndicator', 
  'SeedDataManager', 'StorageSettings'
]

const maybeJsonCompatibleMolecules = [
  'ActionBar', 'BindingEditor', 'CanvasRenderer', 'CodeExplanationDialog',
  'ComponentBindingDialog', 'ComponentPalette', 'ComponentTree', 'DataCard',
  'DataSourceCard', 'DataSourceEditorDialog', 'EditorActions', 'EditorToolbar',
  'EmptyState', 'FileTabs', 'LazyInlineMonacoEditor', 'LazyMonacoEditor',
  'MonacoEditorPanel', 'NavigationItem', 'PageHeaderContent', 'PropertyEditor',
  'SearchBar', 'SearchInput', 'StatCard', 'ToolbarButton', 'TreeCard',
  'TreeFormDialog', 'TreeListHeader'
]

const jsonCompatibleOrganisms = ['PageHeader']

const maybeJsonCompatibleOrganisms = [
  'AppHeader', 'DataSourceManager', 'EmptyCanvasState', 'JSONUIShowcase',
  'NavigationMenu', 'SchemaCodeViewer', 'SchemaEditorCanvas', 
  'SchemaEditorLayout', 'SchemaEditorPropertiesPanel', 'SchemaEditorSidebar',
  'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions', 'TreeListPanel'
]

// Build components array
const components = []

// Process atoms (all are foundational, mark as supported)
atoms.forEach(name => {
  const existing = existingMap.get(name)
  components.push({
    type: name,
    name: existing?.name || name,
    category: existing?.category || guessCategory(name),
    canHaveChildren: existing?.canHaveChildren !== undefined ? existing.canHaveChildren : canHaveChildren(name),
    description: existing?.description || getDescription(name),
    status: existing?.status || 'supported',
    source: 'atoms'
  })
})

// Process molecules with JSON compatibility marking
molecules.forEach(name => {
  const existing = existingMap.get(name)
  let status = existing?.status || 'supported'
  
  if (jsonCompatibleMolecules.includes(name)) {
    status = 'json-compatible'
  } else if (maybeJsonCompatibleMolecules.includes(name)) {
    status = 'maybe-json-compatible'
  }
  
  components.push({
    type: name,
    name: existing?.name || name,
    category: existing?.category || guessCategory(name),
    canHaveChildren: existing?.canHaveChildren !== undefined ? existing.canHaveChildren : canHaveChildren(name),
    description: existing?.description || getDescription(name),
    status,
    source: 'molecules',
    jsonCompatible: jsonCompatibleMolecules.includes(name) || maybeJsonCompatibleMolecules.includes(name)
  })
})

// Process organisms with JSON compatibility marking
organisms.forEach(name => {
  const existing = existingMap.get(name)
  let status = existing?.status || 'supported'
  
  if (jsonCompatibleOrganisms.includes(name)) {
    status = 'json-compatible'
  } else if (maybeJsonCompatibleOrganisms.includes(name)) {
    status = 'maybe-json-compatible'
  }
  
  components.push({
    type: name,
    name: existing?.name || name,
    category: existing?.category || guessCategory(name),
    canHaveChildren: existing?.canHaveChildren !== undefined ? existing.canHaveChildren : true,
    description: existing?.description || `${name} organism component`,
    status,
    source: 'organisms',
    jsonCompatible: jsonCompatibleOrganisms.includes(name) || maybeJsonCompatibleOrganisms.includes(name)
  })
})

// Process ui components (convert kebab-case to PascalCase)
ui.forEach(name => {
  // Convert kebab-case to PascalCase
  const pascalName = name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
  
  const existing = existingMap.get(pascalName) || existingMap.get(name)
  components.push({
    type: pascalName,
    name: existing?.name || pascalName,
    category: existing?.category || guessCategory(pascalName),
    canHaveChildren: existing?.canHaveChildren !== undefined ? existing.canHaveChildren : canHaveChildren(pascalName),
    description: existing?.description || getDescription(pascalName),
    status: existing?.status || 'supported',
    source: 'ui'
  })
})

// Sort by category then name
components.sort((a, b) => {
  if (a.category !== b.category) {
    const order = ['layout', 'input', 'display', 'navigation', 'feedback', 'data', 'custom']
    return order.indexOf(a.category) - order.indexOf(b.category)
  }
  return a.name.localeCompare(b.name)
})

// Count by category
const byCategory = {}
components.forEach(c => {
  byCategory[c.category] = (byCategory[c.category] || 0) + 1
})

// Build the registry
const registry = {
  $schema: './schemas/json-components-registry-schema.json',
  version: '2.0.0',
  description: 'Registry of all components in the application',
  lastUpdated: new Date().toISOString(),
  categories: {
    layout: 'Layout and container components',
    input: 'Form inputs and interactive controls',
    display: 'Display and presentation components',
    navigation: 'Navigation and routing components',
    feedback: 'Alerts, notifications, and status indicators',
    data: 'Data display and visualization components',
    custom: 'Custom domain-specific components'
  },
  components,
  statistics: {
    total: components.length,
    supported: components.filter(c => c.status === 'supported').length,
    planned: components.filter(c => c.status === 'planned').length,
    jsonCompatible: components.filter(c => c.status === 'json-compatible').length,
    maybeJsonCompatible: components.filter(c => c.status === 'maybe-json-compatible').length,
    byCategory,
    bySource: {
      atoms: atoms.length,
      molecules: molecules.length,
      organisms: organisms.length,
      ui: ui.length
    }
  }
}

// Write to file
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8')

console.log('\n✅ Updated json-components-registry.json')
console.log(`   Total components: ${registry.statistics.total}`)
console.log(`   By source:`)
console.log(`     🧱 atoms: ${registry.statistics.bySource.atoms}`)
console.log(`     🧪 molecules: ${registry.statistics.bySource.molecules}`)
console.log(`     🦠 organisms: ${registry.statistics.bySource.organisms}`)
console.log(`     🎨 ui: ${registry.statistics.bySource.ui}`)
console.log(`   JSON compatibility:`)
console.log(`     🔥 Fully compatible: ${registry.statistics.jsonCompatible}`)
console.log(`     ⚠️  Maybe compatible: ${registry.statistics.maybeJsonCompatible}`)
console.log(`   By category:`)
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`     ${cat}: ${count}`)
})
