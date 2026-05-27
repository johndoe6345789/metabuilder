import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { templatesCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'
import { DashboardTemplate } from './DashboardTemplate'
import { LandingPageTemplate } from './LandingPageTemplate'
import { EcommerceTemplate } from './EcommerceTemplate'
import { BlogTemplate } from './BlogTemplate'

const sectionStyle = {
  display: 'flex', flexDirection: 'column' as const, gap: '24px',
}
const h2Style = {
  fontSize: '1.875rem', lineHeight: '2.25rem',
  fontWeight: 700, marginBottom: '8px',
}
const mutedStyle = { color: 'var(--mat-sys-on-surface-variant)' }

interface TemplatesSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function TemplatesSection({ onSaveSnippet }: TemplatesSectionProps) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}
      data-testid="templates-section"
      role="region"
      aria-label="Page layout templates"
    >
      <section style={sectionStyle} data-testid="dashboard-template-section">
        <div>
          <h2 style={h2Style}>Dashboard Layout</h2>
          <p style={mutedStyle}>Complete dashboard with sidebar, stats, and content areas</p>
        </div>
        <ComponentShowcase
          code={templatesCodeSnippets.dashboardLayout}
          title="Dashboard Layout"
          description="Full dashboard template with navigation, sidebar, and stats"
          category="templates"
          onSaveSnippet={onSaveSnippet}
        >
          <DashboardTemplate />
        </ComponentShowcase>
      </section>

      <section style={sectionStyle} data-testid="landing-page-template-section">
        <div>
          <h2 style={h2Style}>Landing Page</h2>
          <p style={mutedStyle}>Marketing page with hero, features, and CTA sections</p>
        </div>
        <ComponentShowcase
          code={templatesCodeSnippets.landingPage}
          title="Landing Page Template"
          description="Full marketing page with hero, features, and CTAs"
          category="templates"
          onSaveSnippet={onSaveSnippet}
        >
          <LandingPageTemplate />
        </ComponentShowcase>
      </section>

      <section style={sectionStyle} data-testid="ecommerce-template-section">
        <div>
          <h2 style={h2Style}>E-commerce Product Page</h2>
          <p style={mutedStyle}>Product detail page with images, info, and purchase options</p>
        </div>
        <ComponentShowcase
          code={templatesCodeSnippets.ecommercePage}
          title="E-commerce Product Page"
          description="Product page with images, details, and purchase options"
          category="templates"
          onSaveSnippet={onSaveSnippet}
        >
          <EcommerceTemplate />
        </ComponentShowcase>
      </section>

      <section style={sectionStyle} data-testid="blog-template-section">
        <div>
          <h2 style={h2Style}>Blog Article</h2>
          <p style={mutedStyle}>Article layout with header, content, and sidebar</p>
        </div>
        <ComponentShowcase
          code={templatesCodeSnippets.blogArticle}
          title="Blog Article"
          description="Article layout with header, content, and navigation"
          category="templates"
          onSaveSnippet={onSaveSnippet}
        >
          <BlogTemplate />
        </ComponentShowcase>
      </section>
    </div>
  )
}
