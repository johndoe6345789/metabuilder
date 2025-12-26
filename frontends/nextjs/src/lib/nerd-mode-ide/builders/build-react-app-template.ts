import { createFileNode } from './create-file-node'
import { createFolderNode } from './create-folder-node'
import type { PackageTemplate, ReactAppTemplateConfig } from './types'

const appLayout = [
  "import './globals.css'",
  '',
  'export const metadata = {',
  "  title: 'MetaBuilder App',",
  "  description: 'Generated Next.js starter',",
  '}',
  '',
  'export default function RootLayout({ children }: { children: React.ReactNode }) {',
  '  return (',
  '    <html lang="en">',
  '      <body>{children}</body>',
  '    </html>',
  '  )',
  '}',
].join('\n')

const appPage = [
  "import { Hero } from '@/components/Hero'",
  '',
  'export default function HomePage() {',
  '  return <Hero />',
  '}',
].join('\n')

const heroComponent = [
  'export function Hero() {',
  '  return (',
  '    <main style={{ padding: "64px", fontFamily: "system-ui" }}>',
  '      <h1 style={{ fontSize: "40px", marginBottom: "16px" }}>MetaBuilder App</h1>',
  '      <p style={{ maxWidth: "560px", lineHeight: 1.6 }}>',
  '        Ship fast with a generated Next.js starter, prewired for package exports.',
  '      </p>',
  '    </main>',
  '  )',
  '}',
].join('\n')

const packageJson = [
  '{',
  '  "name": "metabuilder-web-app",',
  '  "version": "0.1.0",',
  '  "private": true,',
  '  "scripts": {',
  '    "dev": "next dev",',
  '    "build": "next build",',
  '    "start": "next start"',
  '  },',
  '  "dependencies": {',
  '    "next": "latest",',
  '    "react": "latest",',
  '    "react-dom": "latest"',
  '  }',
  '}',
].join('\n')

const nextConfig = [
  'const nextConfig = {',
  '  reactStrictMode: true,',
  '}',
  '',
  'export default nextConfig',
].join('\n')

const tsConfig = [
  '{',
  '  "compilerOptions": {',
  '    "target": "ES2020",',
  '    "lib": ["DOM", "DOM.Iterable", "ES2020"],',
  '    "module": "ESNext",',
  '    "moduleResolution": "Bundler",',
  '    "jsx": "react-jsx",',
  '    "strict": true',
  '  }',
  '}',
].join('\n')

const readme = [
  '# MetaBuilder Web App',
  '',
  'Generated starter with a hero component and app router layout.',
  'Use the Package IDE to export this project as a zip.',
].join('\n')

export function buildReactAppTemplate(config: ReactAppTemplateConfig): PackageTemplate {
  const srcFolder = createFolderNode({
    name: 'src',
    expanded: true,
    children: [
      createFolderNode({
        name: 'app',
        expanded: true,
        children: [
          createFileNode({ name: 'layout.tsx', content: appLayout }),
          createFileNode({ name: 'page.tsx', content: appPage }),
        ],
      }),
      createFolderNode({
        name: 'components',
        expanded: true,
        children: [createFileNode({ name: 'Hero.tsx', content: heroComponent })],
      }),
      createFolderNode({
        name: 'styles',
        expanded: true,
        children: [
          createFileNode({
            name: 'globals.css',
            content: 'body { margin: 0; background: #f8f9fb; color: #111827; }',
          }),
        ],
      }),
    ],
  })

  const publicFolder = createFolderNode({
    name: 'public',
    expanded: true,
    children: [createFileNode({ name: 'robots.txt', content: 'User-agent: *\nAllow: /' })],
  })

  const root = createFolderNode({
    name: config.rootName,
    expanded: true,
    children: [
      srcFolder,
      publicFolder,
      createFileNode({ name: 'package.json', content: packageJson }),
      createFileNode({ name: 'next.config.ts', content: nextConfig }),
      createFileNode({ name: 'tsconfig.json', content: tsConfig }),
      createFileNode({ name: 'README.md', content: readme }),
    ],
  })

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    rootName: config.rootName,
    tree: [root],
    tags: config.tags,
  }
}
