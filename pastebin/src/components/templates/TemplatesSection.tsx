import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { templatesCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'
import { DashboardTemplate } from './DashboardTemplate'
import { LandingPageTemplate } from './LandingPageTemplate'
import { EcommerceTemplate } from './EcommerceTemplate'
import { BlogTemplate } from './BlogTemplate'

interface TemplatesSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function TemplatesSection({ onSaveSnippet }: TemplatesSectionProps) {
  return (
    <div className="space-y-16" data-testid="templates-section" role="region" aria-label="Page layout templates">
      <section className="space-y-6" data-testid="dashboard-template-section">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard Layout</h2>
          <p className="text-muted-foreground">
            Complete dashboard with sidebar, stats, and content areas
          </p>
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

      <section className="space-y-6" data-testid="landing-page-template-section">
        <div>
          <h2 className="text-3xl font-bold mb-2">Landing Page</h2>
          <p className="text-muted-foreground">
            Marketing page with hero, features, and CTA sections
          </p>
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

      <section className="space-y-6" data-testid="ecommerce-template-section">
        <div>
          <h2 className="text-3xl font-bold mb-2">E-commerce Product Page</h2>
          <p className="text-muted-foreground">
            Product detail page with images, info, and purchase options
          </p>
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

      <section className="space-y-6" data-testid="blog-template-section">
        <div>
          <h2 className="text-3xl font-bold mb-2">Blog Article</h2>
          <p className="text-muted-foreground">
            Article layout with header, content, and sidebar
          </p>
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
