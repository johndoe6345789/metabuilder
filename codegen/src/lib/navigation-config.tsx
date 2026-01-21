import {
  ChartBar,
  Code,
  Database,
  Tree,
  FlowArrow,
  PaintBrush,
  Flask,
  Play,
  BookOpen,
  Cube,
  Wrench,
  FileText,
  Gear,
  DeviceMobile,
  Image,
  Faders,
  Lightbulb,
  PencilRuler,
  Atom,
} from '@phosphor-icons/react'
import { FeatureToggles } from '@/types/project'

export interface NavigationItemData {
  id: string
  label: string
  icon: React.ReactNode
  value: string
  badge?: number
  featureKey?: keyof FeatureToggles
}

export interface NavigationGroup {
  id: string
  label: string
  items: NavigationItemData[]
}

export interface TabInfo {
  title: string
  icon: React.ReactNode
  description?: string
}

export const tabInfo: Record<string, TabInfo> = {
  dashboard: {
    title: 'Dashboard',
    icon: <ChartBar size={24} weight="duotone" />,
    description: 'Project overview and statistics',
  },
  code: {
    title: 'Code Editor',
    icon: <Code size={24} weight="duotone" />,
    description: 'Edit project files',
  },
  models: {
    title: 'Models',
    icon: <Database size={24} weight="duotone" />,
    description: 'Define Prisma data models',
  },
  components: {
    title: 'Components',
    icon: <Tree size={24} weight="duotone" />,
    description: 'Create React components',
  },
  'component-trees': {
    title: 'Component Trees',
    icon: <Tree size={24} weight="duotone" />,
    description: 'Manage component hierarchies',
  },
  workflows: {
    title: 'Workflows',
    icon: <FlowArrow size={24} weight="duotone" />,
    description: 'Design automation workflows',
  },
  lambdas: {
    title: 'Lambdas',
    icon: <Code size={24} weight="duotone" />,
    description: 'Serverless functions',
  },
  styling: {
    title: 'Styling',
    icon: <PaintBrush size={24} weight="duotone" />,
    description: 'Theme and design tokens',
  },
  sass: {
    title: 'Sass Styles',
    icon: <PaintBrush size={24} weight="duotone" />,
    description: 'Custom Sass stylesheets',
  },
  favicon: {
    title: 'Favicon Designer',
    icon: <Image size={24} weight="duotone" />,
    description: 'Design app icons',
  },
  flask: {
    title: 'Flask API',
    icon: <Flask size={24} weight="duotone" />,
    description: 'Backend API configuration',
  },
  playwright: {
    title: 'Playwright',
    icon: <Play size={24} weight="duotone" />,
    description: 'E2E test scenarios',
  },
  storybook: {
    title: 'Storybook',
    icon: <BookOpen size={24} weight="duotone" />,
    description: 'Component documentation',
  },
  'unit-tests': {
    title: 'Unit Tests',
    icon: <Cube size={24} weight="duotone" />,
    description: 'Unit test suites',
  },
  errors: {
    title: 'Error Repair',
    icon: <Wrench size={24} weight="duotone" />,
    description: 'Automated error detection and fixing',
  },
  docs: {
    title: 'Documentation',
    icon: <FileText size={24} weight="duotone" />,
    description: 'Project guides and references',
  },
  settings: {
    title: 'Settings',
    icon: <Gear size={24} weight="duotone" />,
    description: 'Project configuration',
  },
  pwa: {
    title: 'PWA',
    icon: <DeviceMobile size={24} weight="duotone" />,
    description: 'Progressive Web App settings',
  },
  features: {
    title: 'Features',
    icon: <Faders size={24} weight="duotone" />,
    description: 'Toggle feature modules',
  },
  ideas: {
    title: 'Feature Ideas',
    icon: <Lightbulb size={24} weight="duotone" />,
    description: 'Brainstorm and organize feature ideas',
  },
  'schema-editor': {
    title: 'Schema Editor',
    icon: <PencilRuler size={24} weight="duotone" />,
    description: 'Visual JSON schema builder',
  },
  'json-ui': {
    title: 'JSON UI Showcase',
    icon: <Code size={24} weight="duotone" />,
    description: 'JSON-driven UI examples',
  },
  'json-conversion-showcase': {
    title: 'JSON Conversion Showcase',
    icon: <BookOpen size={24} weight="duotone" />,
    description: 'JSON conversion showcase overview',
  },
  'atomic-library': {
    title: 'Atomic Components',
    icon: <Atom size={24} weight="duotone" />,
    description: 'Comprehensive atomic component library',
  },
}

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <ChartBar size={18} />,
        value: 'dashboard',
      },
    ],
  },
  {
    id: 'development',
    label: 'Development',
    items: [
      {
        id: 'code',
        label: 'Code Editor',
        icon: <Code size={18} />,
        value: 'code',
        featureKey: 'codeEditor',
      },
      {
        id: 'models',
        label: 'Models',
        icon: <Database size={18} />,
        value: 'models',
        featureKey: 'models',
      },
      {
        id: 'components',
        label: 'Components',
        icon: <Tree size={18} />,
        value: 'components',
        featureKey: 'components',
      },
      {
        id: 'component-trees',
        label: 'Component Trees',
        icon: <Tree size={18} />,
        value: 'component-trees',
        featureKey: 'componentTrees',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    items: [
      {
        id: 'workflows',
        label: 'Workflows',
        icon: <FlowArrow size={18} />,
        value: 'workflows',
        featureKey: 'workflows',
      },
      {
        id: 'lambdas',
        label: 'Lambdas',
        icon: <Code size={18} />,
        value: 'lambdas',
        featureKey: 'lambdas',
      },
    ],
  },
  {
    id: 'design',
    label: 'Design & Styling',
    items: [
      {
        id: 'styling',
        label: 'Styling',
        icon: <PaintBrush size={18} />,
        value: 'styling',
        featureKey: 'styling',
      },
      {
        id: 'sass',
        label: 'Sass Styles',
        icon: <PaintBrush size={18} />,
        value: 'sass',
        featureKey: 'sassStyles',
      },
      {
        id: 'favicon',
        label: 'Favicon Designer',
        icon: <Image size={18} />,
        value: 'favicon',
        featureKey: 'faviconDesigner',
      },
      {
        id: 'ideas',
        label: 'Feature Ideas',
        icon: <Lightbulb size={18} />,
        value: 'ideas',
        featureKey: 'ideaCloud',
      },
      {
        id: 'schema-editor',
        label: 'Schema Editor',
        icon: <PencilRuler size={18} />,
        value: 'schema-editor',
        featureKey: 'schemaEditor',
      },
      {
        id: 'json-ui',
        label: 'JSON UI',
        icon: <Code size={18} />,
        value: 'json-ui',
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    items: [
      {
        id: 'flask',
        label: 'Flask API',
        icon: <Flask size={18} />,
        value: 'flask',
        featureKey: 'flaskApi',
      },
    ],
  },
  {
    id: 'testing',
    label: 'Testing',
    items: [
      {
        id: 'playwright',
        label: 'Playwright',
        icon: <Play size={18} />,
        value: 'playwright',
        featureKey: 'playwright',
      },
      {
        id: 'storybook',
        label: 'Storybook',
        icon: <BookOpen size={18} />,
        value: 'storybook',
        featureKey: 'storybook',
      },
      {
        id: 'unit-tests',
        label: 'Unit Tests',
        icon: <Cube size={18} />,
        value: 'unit-tests',
        featureKey: 'unitTests',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Configuration',
    items: [
      {
        id: 'errors',
        label: 'Error Repair',
        icon: <Wrench size={18} />,
        value: 'errors',
        featureKey: 'errorRepair',
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <FileText size={18} />,
        value: 'docs',
        featureKey: 'documentation',
      },
      {
        id: 'json-conversion-showcase',
        label: 'JSON Conversion Showcase',
        icon: <BookOpen size={18} />,
        value: 'json-conversion-showcase',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Gear size={18} />,
        value: 'settings',
      },
      {
        id: 'pwa',
        label: 'PWA',
        icon: <DeviceMobile size={18} />,
        value: 'pwa',
      },
      {
        id: 'features',
        label: 'Features',
        icon: <Faders size={18} />,
        value: 'features',
      },
    ],
  },
]
