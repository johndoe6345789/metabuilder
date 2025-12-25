import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Five Levels of Power</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4">
              1
            </div>
            <CardTitle>Public Website</CardTitle>
            <CardDescription>
              Beautiful landing pages with responsive design and hamburger menus
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Perfect for marketing sites, portfolios, and public-facing content
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl mb-4">
              2
            </div>
            <CardTitle>User Area</CardTitle>
            <CardDescription>
              Authenticated dashboards with profiles and comment systems
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            User registration, profile management, and interactive features
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl mb-4">
              3
            </div>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Django-style data management with CRUD operations and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Complete control over data models with list views and inline editing
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4">
              4
            </div>
            <CardTitle>God-Tier Builder</CardTitle>
            <CardDescription>
              Meta-builder with workflows, schemas, and Lua scripting
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Design and generate entire applications procedurally
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-amber-500 transition-colors bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-xl mb-4">
              5
            </div>
            <CardTitle className="flex items-center gap-2">
              Super God Panel
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full font-normal">NEW</span>
            </CardTitle>
            <CardDescription>
              Multi-tenant control with power transfer and homepage management
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Supreme administrator access for multi-tenant architecture
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
