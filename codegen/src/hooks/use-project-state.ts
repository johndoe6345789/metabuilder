import { useKV } from '@/hooks/use-kv'
import { 
  ProjectFile, 
  PrismaModel, 
  ComponentNode, 
  ComponentTree, 
  ThemeConfig,
  PlaywrightTest,
  StorybookStory,
  UnitTest,
  FlaskConfig,
  NextJsConfig,
  NpmSettings,
  Workflow,
  Lambda,
  FeatureToggles
} from '@/types/project'

const DEFAULT_FLASK_CONFIG: FlaskConfig = {
  blueprints: [],
  corsOrigins: ['http://localhost:3000'],
  enableSwagger: true,
  port: 5000,
  debug: true,
}

const DEFAULT_NEXTJS_CONFIG: NextJsConfig = {
  appName: 'my-nextjs-app',
  typescript: true,
  eslint: true,
  tailwind: true,
  srcDirectory: true,
  appRouter: true,
  importAlias: '@/*',
  turbopack: false,
  githubRepo: {
    owner: 'johndoe6345789',
    repo: 'low-code-react-app-b',
  },
}

const DEFAULT_NPM_SETTINGS: NpmSettings = {
  packages: [
    { id: '1', name: 'react', version: '^18.2.0', isDev: false },
    { id: '2', name: 'react-dom', version: '^18.2.0', isDev: false },
    { id: '3', name: 'next', version: '^14.0.0', isDev: false },
    { id: '4', name: '@mui/material', version: '^5.14.0', isDev: false },
    { id: '5', name: 'typescript', version: '^5.0.0', isDev: true },
    { id: '6', name: '@types/react', version: '^18.2.0', isDev: true },
  ],
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  packageManager: 'npm',
}

const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  codeEditor: true,
  models: true,
  components: true,
  componentTrees: true,
  workflows: true,
  lambdas: true,
  styling: true,
  flaskApi: true,
  playwright: true,
  storybook: true,
  unitTests: true,
  errorRepair: true,
  documentation: true,
  sassStyles: true,
  faviconDesigner: true,
  ideaCloud: true,
  schemaEditor: true,
  dataBinding: true,
}

const DEFAULT_THEME: ThemeConfig = {
  variants: [
    {
      id: 'light',
      name: 'Light',
      colors: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        errorColor: '#f44336',
        warningColor: '#ff9800',
        successColor: '#4caf50',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        customColors: {},
      },
    },
    {
      id: 'dark',
      name: 'Dark',
      colors: {
        primaryColor: '#90caf9',
        secondaryColor: '#f48fb1',
        errorColor: '#f44336',
        warningColor: '#ffa726',
        successColor: '#66bb6a',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#333333',
        customColors: {},
      },
    },
  ],
  activeVariantId: 'light',
  fontFamily: 'Roboto, Arial, sans-serif',
  fontSize: { small: 12, medium: 14, large: 20 },
  spacing: 8,
  borderRadius: 4,
}

const DEFAULT_FILES: ProjectFile[] = [
  {
    id: 'file-1',
    name: 'page.tsx',
    path: '/src/app/page.tsx',
    content: `'use client'\n\nimport { ThemeProvider } from '@mui/material/styles'\nimport CssBaseline from '@mui/material/CssBaseline'\nimport { theme } from '@/theme'\nimport { Box, Typography, Button } from '@mui/material'\n\nexport default function Home() {\n  return (\n    <ThemeProvider theme={theme}>\n      <CssBaseline />\n      <Box sx={{ p: 4 }}>\n        <Typography variant="h3" gutterBottom>\n          Welcome to Your App\n        </Typography>\n        <Button variant="contained" color="primary">\n          Get Started\n        </Button>\n      </Box>\n    </ThemeProvider>\n  )\n}`,
    language: 'typescript',
  },
  {
    id: 'file-2',
    name: 'layout.tsx',
    path: '/src/app/layout.tsx',
    content: `export const metadata = {\n  title: 'My Next.js App',\n  description: 'Generated with CodeForge',\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}`,
    language: 'typescript',
  },
]

export function useProjectState() {
  console.log('[STATE] 🔧 useProjectState hook initializing')
  console.time('[STATE] Project state initialization')
  
  console.log('[STATE] 📁 Loading files from KV')
  const [files, setFiles] = useKV<ProjectFile[]>('project-files', DEFAULT_FILES)
  console.log('[STATE] ✅ Files loaded:', files?.length || 0, 'files')
  
  console.log('[STATE] 🗃️ Loading models from KV')
  const [models, setModels] = useKV<PrismaModel[]>('project-models', [])
  console.log('[STATE] ✅ Models loaded:', models?.length || 0, 'models')
  
  console.log('[STATE] 🧩 Loading components from KV')
  const [components, setComponents] = useKV<ComponentNode[]>('project-components', [])
  console.log('[STATE] ✅ Components loaded:', components?.length || 0, 'components')
  
  console.log('[STATE] 🌳 Loading component trees from KV')
  const [componentTrees, setComponentTrees] = useKV<ComponentTree[]>('project-component-trees', [
    {
      id: 'default-tree',
      name: 'Main App',
      description: 'Default component tree',
      rootNodes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ])
  console.log('[STATE] ✅ Component trees loaded:', componentTrees?.length || 0, 'trees')
  
  console.log('[STATE] 🔄 Loading workflows from KV')
  const [workflows, setWorkflows] = useKV<Workflow[]>('project-workflows', [])
  console.log('[STATE] ✅ Workflows loaded:', workflows?.length || 0, 'workflows')
  
  console.log('[STATE] λ Loading lambdas from KV')
  const [lambdas, setLambdas] = useKV<Lambda[]>('project-lambdas', [])
  console.log('[STATE] ✅ Lambdas loaded:', lambdas?.length || 0, 'lambdas')
  
  console.log('[STATE] 🎨 Loading theme from KV')
  const [theme, setTheme] = useKV<ThemeConfig>('project-theme', DEFAULT_THEME)
  console.log('[STATE] ✅ Theme loaded')
  
  console.log('[STATE] 🎭 Loading Playwright tests from KV')
  const [playwrightTests, setPlaywrightTests] = useKV<PlaywrightTest[]>('project-playwright-tests', [])
  console.log('[STATE] ✅ Playwright tests loaded:', playwrightTests?.length || 0, 'tests')
  
  console.log('[STATE] 📚 Loading Storybook stories from KV')
  const [storybookStories, setStorybookStories] = useKV<StorybookStory[]>('project-storybook-stories', [])
  console.log('[STATE] ✅ Storybook stories loaded:', storybookStories?.length || 0, 'stories')
  
  console.log('[STATE] 🧪 Loading unit tests from KV')
  const [unitTests, setUnitTests] = useKV<UnitTest[]>('project-unit-tests', [])
  console.log('[STATE] ✅ Unit tests loaded:', unitTests?.length || 0, 'tests')
  
  console.log('[STATE] 🐍 Loading Flask config from KV')
  const [flaskConfig, setFlaskConfig] = useKV<FlaskConfig>('project-flask-config', DEFAULT_FLASK_CONFIG)
  console.log('[STATE] ✅ Flask config loaded')
  
  console.log('[STATE] ⚛️ Loading Next.js config from KV')
  const [nextjsConfig, setNextjsConfig] = useKV<NextJsConfig>('project-nextjs-config', DEFAULT_NEXTJS_CONFIG)
  console.log('[STATE] ✅ Next.js config loaded')
  
  console.log('[STATE] 📦 Loading NPM settings from KV')
  const [npmSettings, setNpmSettings] = useKV<NpmSettings>('project-npm-settings', DEFAULT_NPM_SETTINGS)
  console.log('[STATE] ✅ NPM settings loaded')
  
  console.log('[STATE] 🎚️ Loading feature toggles from KV')
  const [featureToggles, setFeatureToggles] = useKV<FeatureToggles>('project-feature-toggles', DEFAULT_FEATURE_TOGGLES)
  console.log('[STATE] ✅ Feature toggles loaded')

  console.log('[STATE] 🛡️ Creating safe array wrappers')
  const safeFiles = Array.isArray(files) ? files : []
  const safeModels = Array.isArray(models) ? models : []
  const safeComponents = Array.isArray(components) ? components : []
  const safeComponentTrees = Array.isArray(componentTrees) ? componentTrees : []
  const safeWorkflows = Array.isArray(workflows) ? workflows : []
  const safeLambdas = Array.isArray(lambdas) ? lambdas : []
  const safeTheme = (theme && theme.variants && Array.isArray(theme.variants) && theme.variants.length > 0) ? theme : DEFAULT_THEME
  const safePlaywrightTests = Array.isArray(playwrightTests) ? playwrightTests : []
  const safeStorybookStories = Array.isArray(storybookStories) ? storybookStories : []
  const safeUnitTests = Array.isArray(unitTests) ? unitTests : []
  const safeFlaskConfig = flaskConfig || DEFAULT_FLASK_CONFIG
  const safeNextjsConfig = nextjsConfig || DEFAULT_NEXTJS_CONFIG
  const safeNpmSettings = npmSettings || DEFAULT_NPM_SETTINGS
  const safeFeatureToggles = featureToggles || DEFAULT_FEATURE_TOGGLES
  console.log('[STATE] ✅ Safe wrappers created')

  console.log('[STATE] 📤 Returning project state object')
  console.timeEnd('[STATE] Project state initialization')
  
  return {
    files: safeFiles,
    setFiles,
    models: safeModels,
    setModels,
    components: safeComponents,
    setComponents,
    componentTrees: safeComponentTrees,
    setComponentTrees,
    workflows: safeWorkflows,
    setWorkflows,
    lambdas: safeLambdas,
    setLambdas,
    theme: safeTheme,
    setTheme,
    playwrightTests: safePlaywrightTests,
    setPlaywrightTests,
    storybookStories: safeStorybookStories,
    setStorybookStories,
    unitTests: safeUnitTests,
    setUnitTests,
    flaskConfig: safeFlaskConfig,
    setFlaskConfig,
    nextjsConfig: safeNextjsConfig,
    setNextjsConfig,
    npmSettings: safeNpmSettings,
    setNpmSettings,
    featureToggles: safeFeatureToggles,
    setFeatureToggles,
    defaults: {
      DEFAULT_FLASK_CONFIG,
      DEFAULT_NEXTJS_CONFIG,
      DEFAULT_NPM_SETTINGS,
      DEFAULT_FEATURE_TOGGLES,
      DEFAULT_THEME,
      DEFAULT_FILES,
    }
  }
}
