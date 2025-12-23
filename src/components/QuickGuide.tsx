import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Palette, ListDashes, Code, Sparkle } from '@phosphor-icons/react'

export function QuickGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Quick Guide</h2>
        <p className="text-sm text-muted-foreground">Learn how to use the new visual configuration tools</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 space-y-3 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Palette className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-semibold">CSS Class Builder</h3>
              <Badge variant="secondary" className="text-xs">Visual Styling</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            No more typing CSS classes! Click the palette icon next to any className field to visually select from 200+ organized Tailwind classes.
          </p>
          <div className="pt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>10 categorized class groups</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Live preview of selections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Add custom classes when needed</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <ListDashes className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Dynamic Dropdowns</h3>
              <Badge variant="secondary" className="text-xs">Reusable Options</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Create dropdown configurations once and use them across multiple components. Perfect for status fields, categories, and priorities.
          </p>
          <div className="pt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Centralized option management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Update once, apply everywhere</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>GUI-based configuration</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="css">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Palette size={18} />
                How to use CSS Class Builder
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-medium">Step 1: Manage your CSS library</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Go to the "CSS Classes" tab</li>
                  <li>Browse existing categories (Layout, Spacing, Typography, etc.)</li>
                  <li>Add new categories or classes as needed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Step 2: Apply classes to components</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Select a component in the builder</li>
                  <li>Find the "CSS Classes" field in the Property Inspector</li>
                  <li>Click the palette icon <Palette size={14} className="inline" /> button</li>
                  <li>Browse categories and click classes to select them</li>
                  <li>See live preview of your selections</li>
                  <li>Click "Apply Classes" to save</li>
                </ul>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs"><strong>Tip:</strong> You can still type custom classes directly in the input field if you need something specific!</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dropdowns">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <ListDashes size={18} />
                How to create and use Dynamic Dropdowns
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-medium">Step 1: Create a dropdown configuration</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Go to the "Dropdowns" tab in the god-tier panel</li>
                  <li>Click "Create Dropdown"</li>
                  <li>Enter a unique name (e.g., "status_options")</li>
                  <li>Enter a display label (e.g., "Status")</li>
                  <li>Add options with values and labels</li>
                  <li>Click "Save"</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Step 2: Use it in component properties</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>When defining component schemas, use type "dynamic-select"</li>
                  <li>Reference your dropdown by name in the "dynamicSource" field</li>
                  <li>The Property Inspector will automatically show your dropdown</li>
                </ul>
              </div>
              <div className="p-3 bg-muted rounded-md font-mono text-xs">
                <pre>{`{
  name: 'status',
  label: 'Status',
  type: 'dynamic-select',
  dynamicSource: 'status_options'
}`}</pre>
              </div>
              <div className="p-3 bg-accent/10 rounded-md border border-accent/20">
                <p className="text-xs"><strong>Pre-loaded examples:</strong> We've included status, priority, and category dropdowns to get you started!</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="monaco">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Code size={18} />
                Monaco Code Editor Features
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                When editing JSON or Lua code, you'll use the Monaco editor (the same editor that powers VS Code):
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Syntax Highlighting:</strong> Color-coded JSON/Lua syntax</li>
                <li><strong>Auto-formatting:</strong> Press Format JSON button or use Shift+Alt+F</li>
                <li><strong>Error Detection:</strong> See errors as you type</li>
                <li><strong>Bracket Matching:</strong> Colored bracket pairs</li>
                <li><strong>Code Folding:</strong> Collapse/expand sections</li>
                <li><strong>Find & Replace:</strong> Ctrl/Cmd+F to search</li>
                <li><strong>Minimap:</strong> Navigate large files easily</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="best-practices">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Sparkle size={18} />
                Best Practices
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <ul className="space-y-3">
                <li className="space-y-1">
                  <p className="font-medium">Organize CSS classes by purpose</p>
                  <p className="text-muted-foreground ml-4">Keep related classes together in categories for easier discovery</p>
                </li>
                <li className="space-y-1">
                  <p className="font-medium">Name dropdowns descriptively</p>
                  <p className="text-muted-foreground ml-4">Use clear names like "user_status_options" instead of "dropdown1"</p>
                </li>
                <li className="space-y-1">
                  <p className="font-medium">Reuse dropdown configurations</p>
                  <p className="text-muted-foreground ml-4">If multiple components need the same options, create one dropdown and reference it</p>
                </li>
                <li className="space-y-1">
                  <p className="font-medium">Test in preview mode</p>
                  <p className="text-muted-foreground ml-4">Use the preview buttons to see how your changes look on each level</p>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}
