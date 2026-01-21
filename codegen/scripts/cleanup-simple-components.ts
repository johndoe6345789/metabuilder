import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

/**
 * List of simple presentational components that can be safely deleted
 * These were identified by the conversion script as having no hooks or complex logic
 */
const SIMPLE_COMPONENTS = {
  atoms: [
    'ActionIcon', 'Alert', 'AppLogo', 'Avatar', 'Breadcrumb', 'ButtonGroup',
    'Chip', 'Code', 'ColorSwatch', 'Container', 'DataList', 'Divider', 'Dot',
    'EmptyStateIcon', 'FileIcon', 'Flex', 'Grid', 'Heading', 'HelperText',
    'IconText', 'IconWrapper', 'InfoBox', 'InfoPanel', 'Input', 'Kbd',
    'KeyValue', 'Label', 'Link', 'List', 'ListItem', 'LiveIndicator',
    'LoadingSpinner', 'LoadingState', 'MetricDisplay', 'PageHeader', 'Pulse',
    'ResponsiveGrid', 'ScrollArea', 'SearchInput', 'Section', 'Skeleton',
    'Spacer', 'Sparkle', 'Spinner', 'StatusIcon', 'TabIcon', 'Tag', 'Text',
    'TextArea', 'TextGradient', 'TextHighlight', 'Timestamp', 'TreeIcon',
    // Additional simple ones
    'AvatarGroup', 'Checkbox', 'Drawer', 'Modal', 'Notification', 'ProgressBar',
    'Radio', 'Rating', 'Select', 'Slider', 'Stack', 'StepIndicator', 'Stepper',
    'Table', 'Tabs', 'Timeline', 'Toggle',
  ],
  molecules: [
    'ActionBar', 'AppBranding', 'DataCard', 'DataSourceCard', 'EditorActions',
    'EditorToolbar', 'EmptyEditorState', 'EmptyState', 'FileTabs', 'LabelWithBadge',
    'LazyInlineMonacoEditor', 'LazyMonacoEditor', 'LoadingFallback', 'LoadingState',
    'MonacoEditorPanel', 'NavigationItem', 'PageHeaderContent', 'SearchBar',
    'StatCard', 'TreeCard', 'TreeListHeader',
  ],
  organisms: [
    'EmptyCanvasState', 'PageHeader', 'SchemaEditorCanvas', 'SchemaEditorPropertiesPanel',
    'SchemaEditorSidebar', 'SchemaEditorStatusBar', 'SchemaEditorToolbar', 'ToolbarActions',
  ],
  ui: [
    'aspect-ratio', 'avatar', 'badge', 'checkbox', 'collapsible', 'hover-card',
    'input', 'label', 'popover', 'progress', 'radio-group', 'resizable',
    'scroll-area', 'separator', 'skeleton', 'switch', 'textarea', 'toggle',
    // Additional ones
    'accordion', 'alert', 'button', 'card', 'tabs', 'tooltip',
  ],
}

interface DeletionResult {
  deleted: string[]
  kept: string[]
  failed: string[]
}

/**
 * Delete simple TypeScript components
 */
async function deleteSimpleComponents(): Promise<void> {
  console.log('🧹 Cleaning up simple TypeScript components...\n')

  const results: DeletionResult = {
    deleted: [],
    kept: [],
    failed: [],
  }

  // Process each category
  for (const [category, components] of Object.entries(SIMPLE_COMPONENTS)) {
    console.log(`📂 Processing ${category}...`)

    const baseDir = path.join(rootDir, `src/components/${category}`)

    for (const component of components) {
      const fileName = component.endsWith('.tsx') ? component : `${component}.tsx`
      const filePath = path.join(baseDir, fileName)

      try {
        await fs.access(filePath)
        await fs.unlink(filePath)
        results.deleted.push(`${category}/${fileName}`)
        console.log(`   ✅ Deleted: ${fileName}`)
      } catch (error: unknown) {
        // File doesn't exist or couldn't be deleted
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          results.kept.push(`${category}/${fileName}`)
          console.log(`   ⏭️  Skipped: ${fileName} (not found)`)
        } else {
          results.failed.push(`${category}/${fileName}`)
          console.log(`   ❌ Failed: ${fileName}`)
        }
      }
    }

    console.log()
  }

  // Summary
  console.log('📊 Summary:')
  console.log(`   Deleted: ${results.deleted.length} files`)
  console.log(`   Skipped: ${results.kept.length} files`)
  console.log(`   Failed:  ${results.failed.length} files`)

  if (results.failed.length > 0) {
    console.log('\n❌ Failed deletions:')
    results.failed.forEach(f => console.log(`   - ${f}`))
  }

  console.log('\n✨ Cleanup complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Update index.ts files to remove deleted exports')
  console.log('   2. Search for direct imports of deleted components')
  console.log('   3. Run build to check for errors')
  console.log('   4. Run tests to verify functionality')
}

deleteSimpleComponents().catch(console.error)
