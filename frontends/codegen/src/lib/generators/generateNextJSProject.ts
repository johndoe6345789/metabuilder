import { ComponentNode, DbModel, ThemeConfig } from '@/types/project'
import { generateTheme } from './generateMUITheme'
import { generatePrismaSchema } from './generatePrismaSchema'

export function generateNextJSProject(
  projectName: string,
  models: DbModel[],
  components: ComponentNode[],
  theme: ThemeConfig
): Record<string, string> {
  const files: Record<string, string> = {}

  files['package.json'] = JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        '@prisma/client': '^5.8.0',
        next: '14.1.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        prisma: '^5.8.0',
        sass: '^1.77.8',
        typescript: '^5',
      },
    },
    null,
    2
  )

  files['prisma/schema.prisma'] = generatePrismaSchema(models)

  files['src/theme.ts'] = generateTheme(theme)

  const activeVariant = theme.variants.find((variant) => variant.id === theme.activeVariantId) || theme.variants[0]
  const colors = activeVariant?.colors

  files['src/app/layout.tsx'] = `import './globals.scss'

export const metadata = {
  title: '${projectName}',
  description: 'Generated with CodeForge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`

  files['src/app/globals.scss'] = `:root {
  color-scheme: light;
  --background: ${colors?.background ?? '#ffffff'};
  --surface: ${colors?.surface ?? '#f7f7f7'};
  --surface-variant: ${colors?.border ?? '#e5e7eb'};
  --text-primary: ${colors?.text ?? '#111827'};
  --text-secondary: ${colors?.textSecondary ?? '#4b5563'};
  --primary: ${colors?.primaryColor ?? '#6750a4'};
  --secondary: ${colors?.secondaryColor ?? '#625b71'};
  --error: ${colors?.errorColor ?? '#b3261e'};
  --warning: ${colors?.warningColor ?? '#f9ab00'};
  --success: ${colors?.successColor ?? '#146c2e'};
  --font-family: ${theme.fontFamily};
  --radius: ${theme.borderRadius}px;
  --space: ${theme.spacing}px;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--font-family);
}

* {
  box-sizing: border-box;
}

.app-shell {
  min-height: 100vh;
  padding: calc(var(--space) * 4);
}

.hero {
  max-width: 42rem;
  display: grid;
  gap: calc(var(--space) * 2);
}

.hero__eyebrow {
  color: var(--text-secondary);
  font-size: 0.875rem;
  letter-spacing: 0;
}

.hero__title {
  margin: 0;
  font-size: 2.5rem;
  line-height: 1.1;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--space) * 1.5);
}

.button {
  appearance: none;
  border: 0;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  font: inherit;
  cursor: pointer;
}

.button--primary {
  background: var(--primary);
  color: white;
}

.button--secondary {
  background: transparent;
  color: var(--text-primary);
  box-shadow: inset 0 0 0 1px var(--surface-variant);
}`

  files['src/app/page.tsx'] = `export default function Home() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="hero__eyebrow">Generated starter</p>
        <h1 className="hero__title">Build your app with SCSS and design tokens.</h1>
        <p>
          This starter keeps the runtime lean: no MUI dependency, no Emotion, just
          Next.js, Prisma, and a token-driven SCSS layer.
        </p>
        <div className="hero__actions">
          <button className="button button--primary" type="button">
            Get Started
          </button>
          <button className="button button--secondary" type="button">
            View Docs
          </button>
        </div>
      </section>
    </main>
  )
}`

  files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`

  files['.env'] = `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"`

  files['README.md'] = `# ${projectName}

Generated with CodeForge

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up your database in .env

3. Run Prisma migrations:
\`\`\`bash
npx prisma migrate dev
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser.`

  return files
}
