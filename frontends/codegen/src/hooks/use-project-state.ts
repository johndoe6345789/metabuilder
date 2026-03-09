/**
 * useProjectState — central hook for all project-level state
 *
 * Reads from dedicated Redux slices (files, models, components, etc.)
 * and provides setter functions that dispatch to those slices.
 * No more useKV — every piece of state has a typed home.
 */
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setFiles } from '@/store/slices/filesSlice'
import { setModels } from '@/store/slices/modelsSlice'
import { setComponents } from '@/store/slices/componentsSlice'
import { setWorkflows } from '@/store/slices/workflowsSlice'
import { setLambdas } from '@/store/slices/lambdasSlice'
import { setPlaywrightTests, setStorybookStories, setUnitTests } from '@/store/slices/testsSlice'
import {
  setFlaskConfig,
  setNextjsConfig,
  setNpmSettings,
  setFeatureToggles,
  DEFAULT_FLASK_CONFIG,
  DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
} from '@/store/slices/configSlice'
import { useUIState } from '@/hooks/use-ui-state'
import {
  ProjectFile,
  DbModel,
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
  {
    id: 'file-3',
    name: 'globals.css',
    path: '/src/app/globals.css',
    content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-start-rgb: 214, 219, 220;\n  --background-end-rgb: 255, 255, 255;\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: linear-gradient(\n    to bottom,\n    transparent,\n    rgb(var(--background-end-rgb))\n  ) rgb(var(--background-start-rgb));\n}`,
    language: 'css',
  },
  {
    id: 'file-4',
    name: 'api.ts',
    path: '/src/lib/api.ts',
    content: `const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'\n\nexport async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {\n  const res = await fetch(\`\${API_BASE}\${endpoint}\`, {\n    headers: { 'Content-Type': 'application/json', ...options?.headers },\n    ...options,\n  })\n  if (!res.ok) throw new Error(\`API error: \${res.status}\`)\n  return res.json()\n}\n\nexport const api = {\n  users: {\n    list: () => fetchAPI<any[]>('/api/v1/default/core/user'),\n    get: (id: string) => fetchAPI<any>(\`/api/v1/default/core/user/\${id}\`),\n  },\n}`,
    language: 'typescript',
  },
]

const DEFAULT_MODELS: DbModel[] = [
  {
    id: 'model-1',
    name: 'User',
    fields: [
      { id: 'f-1', name: 'id', type: 'String', isRequired: true, isUnique: true, isArray: false, defaultValue: 'uuid()' },
      { id: 'f-2', name: 'email', type: 'String', isRequired: true, isUnique: true, isArray: false },
      { id: 'f-3', name: 'name', type: 'String', isRequired: false, isUnique: false, isArray: false },
      { id: 'f-4', name: 'role', type: 'String', isRequired: true, isUnique: false, isArray: false, defaultValue: "'user'" },
      { id: 'f-5', name: 'createdAt', type: 'DateTime', isRequired: true, isUnique: false, isArray: false, defaultValue: 'now()' },
    ],
  },
  {
    id: 'model-2',
    name: 'Post',
    fields: [
      { id: 'f-6', name: 'id', type: 'String', isRequired: true, isUnique: true, isArray: false, defaultValue: 'uuid()' },
      { id: 'f-7', name: 'title', type: 'String', isRequired: true, isUnique: false, isArray: false },
      { id: 'f-8', name: 'content', type: 'String', isRequired: false, isUnique: false, isArray: false },
      { id: 'f-9', name: 'published', type: 'Boolean', isRequired: true, isUnique: false, isArray: false, defaultValue: 'false' },
      { id: 'f-10', name: 'authorId', type: 'String', isRequired: true, isUnique: false, isArray: false, relation: 'User' },
    ],
  },
  {
    id: 'model-3',
    name: 'Session',
    fields: [
      { id: 'f-11', name: 'id', type: 'String', isRequired: true, isUnique: true, isArray: false, defaultValue: 'uuid()' },
      { id: 'f-12', name: 'userId', type: 'String', isRequired: true, isUnique: false, isArray: false, relation: 'User' },
      { id: 'f-13', name: 'token', type: 'String', isRequired: true, isUnique: true, isArray: false },
      { id: 'f-14', name: 'expiresAt', type: 'DateTime', isRequired: true, isUnique: false, isArray: false },
    ],
  },
]

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'User Registration',
    description: 'Validates input, creates user, sends welcome email',
    nodes: [
      { id: 'n-1', type: 'trigger', name: 'Form Submit', position: { x: 100, y: 100 }, data: { label: 'Registration Form' }, config: { triggerType: 'event' } },
      { id: 'n-2', type: 'action', name: 'Validate', position: { x: 300, y: 100 }, data: { label: 'Validate Input' } },
      { id: 'n-3', type: 'database', name: 'Create User', position: { x: 500, y: 100 }, data: { label: 'Insert User' }, config: { databaseQuery: 'INSERT INTO users' } },
      { id: 'n-4', type: 'lambda', name: 'Send Email', position: { x: 700, y: 100 }, data: { label: 'Welcome Email' }, config: { lambdaCode: '// send email' } },
    ],
    connections: [
      { id: 'c-1', source: 'n-1', target: 'n-2' },
      { id: 'c-2', source: 'n-2', target: 'n-3' },
      { id: 'c-3', source: 'n-3', target: 'n-4' },
    ],
    isActive: true, status: 'success', lastRun: Date.now() - 3600000, createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000,
  },
]

const DEFAULT_COMPONENTS: ComponentNode[] = [
  { id: 'comp-1', type: 'Button', name: 'PrimaryButton', props: { variant: 'contained', color: 'primary' }, children: [] },
  { id: 'comp-2', type: 'Card', name: 'UserCard', props: { elevation: 2 }, children: [
    { id: 'comp-3', type: 'CardContent', name: 'CardBody', props: {}, children: [] },
  ] },
  { id: 'comp-4', type: 'TextField', name: 'SearchInput', props: { placeholder: 'Search...', variant: 'outlined', size: 'small' }, children: [] },
]

export function useProjectState() {
  const dispatch = useAppDispatch()

  // ── Domain entities from dedicated slices ──────────────────────────────
  const sliceFiles = useAppSelector((s) => s.files?.files ?? [])
  const sliceModels = useAppSelector((s) => s.models?.models ?? [])
  const sliceComponents = useAppSelector((s) => s.components?.components ?? [])
  const sliceWorkflows = useAppSelector((s) => s.workflows?.workflows ?? [])
  const sliceLambdas = useAppSelector((s) => s.lambdas?.lambdas ?? [])

  // ── Tests from tests slice ────────────────────────────────────────────
  const slicePlaywrightTests = useAppSelector((s) => s.tests?.playwrightTests ?? [])
  const sliceStorybookStories = useAppSelector((s) => s.tests?.storybookStories ?? [])
  const sliceUnitTests = useAppSelector((s) => s.tests?.unitTests ?? [])

  // ── Config from config slice ──────────────────────────────────────────
  const sliceFlaskConfig = useAppSelector((s) => s.config?.flaskConfig ?? DEFAULT_FLASK_CONFIG)
  const sliceNextjsConfig = useAppSelector((s) => s.config?.nextjsConfig ?? DEFAULT_NEXTJS_CONFIG)
  const sliceNpmSettings = useAppSelector((s) => s.config?.npmSettings ?? DEFAULT_NPM_SETTINGS)
  const sliceFeatureToggles = useAppSelector((s) => s.config?.featureToggles ?? DEFAULT_FEATURE_TOGGLES)

  // ── Theme and component trees via uiState (different schema than slices) ─
  const [componentTrees, setComponentTreesRaw] = useUIState<ComponentTree[]>('project-component-trees', [
    {
      id: 'default-tree',
      name: 'Main App',
      description: 'Default component tree',
      rootNodes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ])
  const [theme, setThemeRaw] = useUIState<ThemeConfig>('project-theme', DEFAULT_THEME)

  // ── Safe accessors (defensive — ensures arrays/objects, falls back to defaults when empty) ─
  const safeFiles = (Array.isArray(sliceFiles) && sliceFiles.length > 0) ? sliceFiles as unknown as ProjectFile[] : DEFAULT_FILES
  const safeModels = (Array.isArray(sliceModels) && sliceModels.length > 0) ? sliceModels as unknown as DbModel[] : DEFAULT_MODELS
  const safeComponents = (Array.isArray(sliceComponents) && sliceComponents.length > 0) ? sliceComponents as unknown as ComponentNode[] : DEFAULT_COMPONENTS
  const safeComponentTrees = Array.isArray(componentTrees) ? componentTrees : []
  const safeWorkflows = (Array.isArray(sliceWorkflows) && sliceWorkflows.length > 0) ? sliceWorkflows as unknown as Workflow[] : DEFAULT_WORKFLOWS
  const safeLambdas = Array.isArray(sliceLambdas) ? sliceLambdas as unknown as Lambda[] : []
  const safeTheme = (theme && theme.variants && Array.isArray(theme.variants) && theme.variants.length > 0) ? theme : DEFAULT_THEME
  const safePlaywrightTests = Array.isArray(slicePlaywrightTests) ? slicePlaywrightTests : []
  const safeStorybookStories = Array.isArray(sliceStorybookStories) ? sliceStorybookStories : []
  const safeUnitTests = Array.isArray(sliceUnitTests) ? sliceUnitTests : []
  const safeFlaskConfig = sliceFlaskConfig || DEFAULT_FLASK_CONFIG
  const safeNextjsConfig = sliceNextjsConfig || DEFAULT_NEXTJS_CONFIG
  const safeNpmSettings = sliceNpmSettings || DEFAULT_NPM_SETTINGS
  const safeFeatureToggles = sliceFeatureToggles || DEFAULT_FEATURE_TOGGLES

  // ── Setter functions (dispatch to slices) ─────────────────────────────
  const handleSetFiles = useCallback((value: ProjectFile[] | ((prev: ProjectFile[]) => ProjectFile[])) => {
    if (typeof value === 'function') {
      const next = value(safeFiles)
      dispatch(setFiles(next as any))
    } else {
      dispatch(setFiles(value as any))
    }
  }, [dispatch, safeFiles])

  const handleSetModels = useCallback((value: DbModel[] | ((prev: DbModel[]) => DbModel[])) => {
    if (typeof value === 'function') {
      const next = value(safeModels)
      dispatch(setModels(next as any))
    } else {
      dispatch(setModels(value as any))
    }
  }, [dispatch, safeModels])

  const handleSetComponents = useCallback((value: ComponentNode[] | ((prev: ComponentNode[]) => ComponentNode[])) => {
    if (typeof value === 'function') {
      const next = value(safeComponents)
      dispatch(setComponents(next as any))
    } else {
      dispatch(setComponents(value as any))
    }
  }, [dispatch, safeComponents])

  const handleSetWorkflows = useCallback((value: Workflow[] | ((prev: Workflow[]) => Workflow[])) => {
    if (typeof value === 'function') {
      const next = value(safeWorkflows)
      dispatch(setWorkflows(next as any))
    } else {
      dispatch(setWorkflows(value as any))
    }
  }, [dispatch, safeWorkflows])

  const handleSetLambdas = useCallback((value: Lambda[] | ((prev: Lambda[]) => Lambda[])) => {
    if (typeof value === 'function') {
      const next = value(safeLambdas)
      dispatch(setLambdas(next as any))
    } else {
      dispatch(setLambdas(value as any))
    }
  }, [dispatch, safeLambdas])

  const handleSetPlaywrightTests = useCallback((value: PlaywrightTest[] | ((prev: PlaywrightTest[]) => PlaywrightTest[])) => {
    if (typeof value === 'function') {
      dispatch(setPlaywrightTests(value(safePlaywrightTests)))
    } else {
      dispatch(setPlaywrightTests(value))
    }
  }, [dispatch, safePlaywrightTests])

  const handleSetStorybookStories = useCallback((value: StorybookStory[] | ((prev: StorybookStory[]) => StorybookStory[])) => {
    if (typeof value === 'function') {
      dispatch(setStorybookStories(value(safeStorybookStories)))
    } else {
      dispatch(setStorybookStories(value))
    }
  }, [dispatch, safeStorybookStories])

  const handleSetUnitTests = useCallback((value: UnitTest[] | ((prev: UnitTest[]) => UnitTest[])) => {
    if (typeof value === 'function') {
      dispatch(setUnitTests(value(safeUnitTests)))
    } else {
      dispatch(setUnitTests(value))
    }
  }, [dispatch, safeUnitTests])

  const handleSetFlaskConfig = useCallback((value: FlaskConfig | ((prev: FlaskConfig) => FlaskConfig)) => {
    dispatch(setFlaskConfig(value))
  }, [dispatch])

  const handleSetNextjsConfig = useCallback((value: NextJsConfig | ((prev: NextJsConfig) => NextJsConfig)) => {
    dispatch(setNextjsConfig(value))
  }, [dispatch])

  const handleSetNpmSettings = useCallback((value: NpmSettings | ((prev: NpmSettings) => NpmSettings)) => {
    dispatch(setNpmSettings(value))
  }, [dispatch])

  const handleSetFeatureToggles = useCallback((value: FeatureToggles | ((prev: FeatureToggles) => FeatureToggles)) => {
    dispatch(setFeatureToggles(value))
  }, [dispatch])

  return {
    files: safeFiles,
    setFiles: handleSetFiles,
    models: safeModels,
    setModels: handleSetModels,
    components: safeComponents,
    setComponents: handleSetComponents,
    componentTrees: safeComponentTrees,
    setComponentTrees: setComponentTreesRaw,
    workflows: safeWorkflows,
    setWorkflows: handleSetWorkflows,
    lambdas: safeLambdas,
    setLambdas: handleSetLambdas,
    theme: safeTheme,
    setTheme: setThemeRaw,
    playwrightTests: safePlaywrightTests,
    setPlaywrightTests: handleSetPlaywrightTests,
    storybookStories: safeStorybookStories,
    setStorybookStories: handleSetStorybookStories,
    unitTests: safeUnitTests,
    setUnitTests: handleSetUnitTests,
    flaskConfig: safeFlaskConfig,
    setFlaskConfig: handleSetFlaskConfig,
    nextjsConfig: safeNextjsConfig,
    setNextjsConfig: handleSetNextjsConfig,
    npmSettings: safeNpmSettings,
    setNpmSettings: handleSetNpmSettings,
    featureToggles: safeFeatureToggles,
    setFeatureToggles: handleSetFeatureToggles,
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
