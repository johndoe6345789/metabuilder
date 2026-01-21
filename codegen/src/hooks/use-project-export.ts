import { useState } from 'react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import {
  ProjectFile,
  PrismaModel,
  ComponentNode,
  ThemeConfig,
  PlaywrightTest,
  StorybookStory,
  UnitTest,
  FlaskConfig,
  NextJsConfig,
  NpmSettings,
} from '@/types/project'
import {
  generateNextJSProject,
  generatePrismaSchema,
  generateMUITheme,
  generatePlaywrightTests,
  generateStorybookStories,
  generateUnitTests,
  generateFlaskApp,
} from '@/lib/generators'

export function useProjectExport(
  files: ProjectFile[],
  models: PrismaModel[],
  components: ComponentNode[],
  theme: ThemeConfig,
  playwrightTests: PlaywrightTest[],
  storybookStories: StorybookStory[],
  unitTests: UnitTest[],
  flaskConfig: FlaskConfig,
  nextjsConfig: NextJsConfig,
  npmSettings: NpmSettings
) {
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({})
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const handleExportProject = () => {
    const projectFiles = generateNextJSProject(nextjsConfig.appName, models, components, theme)
    
    const prismaSchema = generatePrismaSchema(models)
    const themeCode = generateMUITheme(theme)
    const playwrightTestCode = generatePlaywrightTests(playwrightTests)
    const storybookFiles = generateStorybookStories(storybookStories)
    const unitTestFiles = generateUnitTests(unitTests)
    const flaskFiles = generateFlaskApp(flaskConfig)
    
    const packageJson = {
      name: nextjsConfig.appName,
      version: '0.1.0',
      private: true,
      scripts: npmSettings.scripts,
      dependencies: npmSettings.packages
        .filter(pkg => !pkg.isDev)
        .reduce((acc, pkg) => {
          acc[pkg.name] = pkg.version
          return acc
        }, {} as Record<string, string>),
      devDependencies: npmSettings.packages
        .filter(pkg => pkg.isDev)
        .reduce((acc, pkg) => {
          acc[pkg.name] = pkg.version
          return acc
        }, {} as Record<string, string>),
    }
    
    const allFiles: Record<string, string> = {
      ...projectFiles,
      'package.json': JSON.stringify(packageJson, null, 2),
      'prisma/schema.prisma': prismaSchema,
      'src/theme.ts': themeCode,
      'e2e/tests.spec.ts': playwrightTestCode,
      ...storybookFiles,
      ...unitTestFiles,
    }
    
    Object.entries(flaskFiles).forEach(([path, content]) => {
      allFiles[`backend/${path}`] = content
    })
    
    files.forEach(file => {
      allFiles[file.path] = file.content
    })

    setGeneratedCode(allFiles)
    setExportDialogOpen(true)
    toast.success('Project files generated!')
  }

  const handleDownloadZip = async () => {
    try {
      toast.info('Creating ZIP file...')
      
      const zip = new JSZip()
      
      Object.entries(generatedCode).forEach(([path, content]) => {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        zip.file(cleanPath, content)
      })
      
      zip.file('README.md', `# ${nextjsConfig.appName}

Generated with CodeForge

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up Prisma (if using database):
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run E2E tests:
\`\`\`bash
npm run test:e2e
\`\`\`

Run unit tests:
\`\`\`bash
npm run test
\`\`\`

## Flask Backend (Optional)

Navigate to the backend directory and follow the setup instructions.
`)
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nextjsConfig.appName}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Project downloaded successfully!')
    } catch (error) {
      console.error('Failed to create ZIP:', error)
      toast.error('Failed to create ZIP file')
    }
  }

  return {
    generatedCode,
    exportDialogOpen,
    setExportDialogOpen,
    handleExportProject,
    handleDownloadZip,
  }
}
