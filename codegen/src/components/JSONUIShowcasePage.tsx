import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AtomicComponentDemo } from '@/components/AtomicComponentDemo'
import { DashboardDemoPage } from '@/components/DashboardDemoPage'
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { hydrateSchema } from '@/schemas/schema-loader'
import pageSchemasJson from '@/schemas/page-schemas.json'
import todoListJson from '@/schemas/todo-list.json'
import newMoleculesShowcaseJson from '@/schemas/new-molecules-showcase.json'

const todoListSchema = hydrateSchema(todoListJson)
const newMoleculesShowcaseSchema = hydrateSchema(newMoleculesShowcaseJson)
const dataComponentsDemoSchema = hydrateSchema(pageSchemasJson.dataComponentsDemoSchema)

export function JSONUIShowcasePage() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <Tabs defaultValue="atomic" className="h-full flex flex-col">
        <div className="border-b border-border px-6 pt-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JSON-Driven UI Showcase
            </h1>
            <p className="text-muted-foreground mt-2">
              Demonstrating atomic components, custom hooks, and JSON-driven architecture
            </p>
          </div>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="atomic">Atomic Components</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Atoms</TabsTrigger>
            <TabsTrigger value="molecules">New Molecules</TabsTrigger>
            <TabsTrigger value="data-components">Data Components</TabsTrigger>
            <TabsTrigger value="dashboard">JSON Dashboard</TabsTrigger>
            <TabsTrigger value="todos">JSON Todo List</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="atomic" className="h-full m-0 data-[state=active]:block">
            <AtomicComponentDemo />
          </TabsContent>

          <TabsContent value="feedback" className="h-full m-0 data-[state=active]:block">
            <PageRenderer schema={feedbackAtomsDemoSchema} />
          </TabsContent>
          
          <TabsContent value="molecules" className="h-full m-0 data-[state=active]:block">
            <PageRenderer schema={newMoleculesShowcaseSchema} />
          </TabsContent>

          <TabsContent value="data-components" className="h-full m-0 data-[state=active]:block">
            <PageRenderer schema={dataComponentsDemoSchema} />
          </TabsContent>
          
          <TabsContent value="dashboard" className="h-full m-0 data-[state=active]:block">
            <DashboardDemoPage />
          </TabsContent>
          
          <TabsContent value="todos" className="h-full m-0 data-[state=active]:block">
            <PageRenderer schema={todoListSchema} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
