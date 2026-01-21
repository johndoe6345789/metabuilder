/// <reference path="../global.d.ts" />

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useSeedTemplates } from '@/hooks/data/use-seed-templates'
import { Copy, Download } from '@phosphor-icons/react'
import templateUi from '@/config/template-ui.json'
import { useTemplateExplorerActions } from '@/hooks/use-template-explorer-actions'

const ui = templateUi.explorer

type TemplateData = Record<string, any>

type TemplateExplorerHeaderProps = {
  onExport: () => void
}

type TemplateListProps = {
  templates: Array<{ id: string; name: string; icon: string }>
  selectedTemplate: string
  onSelect: (templateId: string) => void
}

type TemplateDetailProps = {
  template: {
    name: string
    description: string
    icon: string
    data: TemplateData
    features: string[]
  }
  onDownload: () => void
  onCopyJson: () => void
}

const TemplateExplorerHeader = ({ onExport }: TemplateExplorerHeaderProps) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold mb-2">{ui.title}</h2>
      <p className="text-muted-foreground">{ui.description}</p>
    </div>
    <Button onClick={onExport} variant="outline">
      <Download className="mr-2" size={16} />
      {ui.buttons.exportCurrentData}
    </Button>
  </div>
)

const TemplateList = ({ templates, selectedTemplate, onSelect }: TemplateListProps) => (
  <div className="space-y-2">
    {templates.map((template) => (
      <Card
        key={template.id}
        className={`cursor-pointer transition-colors ${
          selectedTemplate === template.id ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'
        }`}
        onClick={() => onSelect(template.id)}
      >
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{template.icon}</span>
            <CardTitle className="text-sm">{template.name}</CardTitle>
          </div>
        </CardHeader>
      </Card>
    ))}
  </div>
)

const TemplateOverviewTab = ({ data, features }: { data: TemplateData; features: string[] }) => (
  <TabsContent value="overview" className="space-y-4">
    <div>
      <h3 className="font-semibold mb-2">{ui.sections.features}</h3>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, idx) => (
          <Badge key={idx} variant="secondary">
            {feature}
          </Badge>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value]) => (
        <Card key={key}>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">{key.replace('project-', '')}</CardTitle>
            <CardDescription>
              {Array.isArray(value) ? `${value.length} ${ui.labels.itemsSuffix}` : ui.labels.configuration}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  </TabsContent>
)

const TemplateStructureTab = ({ data }: { data: TemplateData }) => (
  <TabsContent value="structure" className="space-y-4">
    <ScrollArea className="h-[500px]">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{key}</h3>
            <Badge variant="outline">
              {Array.isArray(value) ? `${value.length} ${ui.labels.itemsSuffix}` : ui.labels.object}
            </Badge>
          </div>
          {Array.isArray(value) && value.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {value.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="py-1">
                  • {item.name || item.title || item.id}
                </div>
              ))}
              {value.length > 3 && (
                <div className="py-1 italic">
                  {`${ui.labels.morePrefix} ${value.length - 3} ${ui.labels.moreSuffix}`}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </ScrollArea>
  </TabsContent>
)

const TemplateJsonTab = ({ data, onCopy }: { data: TemplateData; onCopy: () => void }) => (
  <TabsContent value="json">
    <div className="relative">
      <Button size="sm" variant="ghost" className="absolute right-2 top-2 z-10" onClick={onCopy}>
        <Copy size={16} />
      </Button>
      <ScrollArea className="h-[500px]">
        <pre className="text-xs p-4 bg-muted rounded-lg">{JSON.stringify(data, null, 2)}</pre>
      </ScrollArea>
    </div>
  </TabsContent>
)

const TemplateDetails = ({ template, onDownload, onCopyJson }: TemplateDetailProps) => (
  <Card className="col-span-3">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{template.icon}</span>
          <div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
        </div>
        <Button onClick={onDownload} variant="outline" size="sm">
          <Download className="mr-2" size={16} />
          {ui.buttons.download}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{ui.tabs.overview}</TabsTrigger>
          <TabsTrigger value="structure">{ui.tabs.structure}</TabsTrigger>
          <TabsTrigger value="json">{ui.tabs.json}</TabsTrigger>
        </TabsList>

        <TemplateOverviewTab data={template.data} features={template.features} />
        <TemplateStructureTab data={template.data} />
        <TemplateJsonTab
          data={template.data}
          onCopy={onCopyJson}
        />
      </Tabs>
    </CardContent>
  </Card>
)

export function TemplateExplorer() {
  const { templates } = useSeedTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || 'default')

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  const {
    copyToClipboard,
    downloadJSON,
    exportCurrentData
  } = useTemplateExplorerActions(currentTemplate)

  if (!currentTemplate) return null

  const handleCopyJson = () => copyToClipboard(JSON.stringify(currentTemplate.data, null, 2))

  return (
    <div className="space-y-6">
      <TemplateExplorerHeader onExport={exportCurrentData} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TemplateList
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelect={setSelectedTemplate}
        />
        <TemplateDetails
          template={currentTemplate}
          onDownload={downloadJSON}
          onCopyJson={handleCopyJson}
        />
      </div>
    </div>
  )
}
