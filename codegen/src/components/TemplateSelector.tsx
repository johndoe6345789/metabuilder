import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSeedTemplates, type Template, type TemplateType } from '@/hooks/data/use-seed-templates'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TemplateExplorer } from './TemplateExplorer'
import { toast } from 'sonner'
import { Download, Package, Plus, Trash } from '@phosphor-icons/react'
import templateUi from '@/config/template-ui.json'

const ui = templateUi.selector

type TemplateSelectorHeaderProps = {
  title: string
  description: string
}

type TemplateCardProps = {
  template: Template
  isLoading: boolean
  onSelect: (templateId: TemplateType, action: 'replace' | 'merge') => void
}

type TemplateActionsAlertProps = {
  loadTitle: string
  loadDescription: string
  mergeTitle: string
  mergeDescription: string
}

type ConfirmDialogState = {
  open: boolean
  actionType: 'replace' | 'merge'
  template: TemplateType | null
}

type ConfirmDialogProps = ConfirmDialogState & {
  onCancel: () => void
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

const TemplateSelectorHeader = ({ title, description }: TemplateSelectorHeaderProps) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

const TemplateCard = ({ template, isLoading, onSelect }: TemplateCardProps) => (
  <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{template.icon}</span>
          <div>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {template.features.map((feature, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onSelect(template.id, 'replace')}
          disabled={isLoading}
          className="flex-1"
        >
          <Download className="mr-2" size={16} />
          {ui.buttons.loadTemplate}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(template.id, 'merge')}
          disabled={isLoading}
          className="flex-1"
        >
          <Plus className="mr-2" size={16} />
          {ui.buttons.merge}
        </Button>
      </div>
    </CardContent>
  </Card>
)

const TemplateActionsAlert = ({
  loadTitle,
  loadDescription,
  mergeTitle,
  mergeDescription
}: TemplateActionsAlertProps) => (
  <Alert>
    <Package size={16} />
    <AlertDescription>
      <strong>{loadTitle}</strong> {loadDescription}
      <br />
      <strong>{mergeTitle}</strong> {mergeDescription}
    </AlertDescription>
  </Alert>
)

const ConfirmDialog = ({
  open,
  actionType,
  template,
  onCancel,
  onConfirm,
  onOpenChange
}: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {actionType === 'replace' ? ui.dialog.replaceTitle : ui.dialog.mergeTitle}
        </DialogTitle>
        <DialogDescription>
          {actionType === 'replace' ? (
            <>
              {ui.dialog.replace.prefix}{' '}
              <strong className="text-destructive">{ui.dialog.replace.emphasis}</strong> {ui.dialog.replace.middle}{' '}
              <strong>{template}</strong> {ui.dialog.replace.suffix}
            </>
          ) : (
            <>
              {ui.dialog.merge.prefix}{' '}
              <strong>{ui.dialog.merge.emphasis}</strong> {ui.dialog.merge.middle}{' '}
              <strong>{template}</strong> {ui.dialog.merge.suffix}
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {ui.buttons.cancel}
        </Button>
        <Button variant={actionType === 'replace' ? 'destructive' : 'default'} onClick={onConfirm}>
          {actionType === 'replace' ? (
            <>
              <Trash className="mr-2" size={16} />
              {ui.buttons.replaceAllData}
            </>
          ) : (
            <>
              <Plus className="mr-2" size={16} />
              {ui.buttons.mergeData}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

const formatToastDescription = (actionType: 'replace' | 'merge', template: TemplateType) => {
  const description = actionType === 'replace'
    ? ui.toasts.replaceDescription
    : ui.toasts.mergeDescription
  return description.replace('{template}', template)
}

const useConfirmDialog = ({
  clearAndLoadTemplate,
  mergeTemplate
}: Pick<ReturnType<typeof useSeedTemplates>, 'clearAndLoadTemplate' | 'mergeTemplate'>) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    actionType: 'replace',
    template: null
  })

  const handleSelectTemplate = (templateId: TemplateType, action: 'replace' | 'merge') => {
    setConfirmDialog({ open: true, actionType: action, template: templateId })
  }

  const handleConfirmLoad = async () => {
    if (!confirmDialog.template) return

    setConfirmDialog(prevState => ({ ...prevState, open: false }))

    const success = confirmDialog.actionType === 'replace'
      ? await clearAndLoadTemplate(confirmDialog.template)
      : await mergeTemplate(confirmDialog.template)

    if (success) {
      toast.success(ui.toasts.successTitle, {
        description: formatToastDescription(confirmDialog.actionType, confirmDialog.template)
      })
      window.location.reload()
    } else {
      toast.error(ui.toasts.errorTitle, {
        description: ui.toasts.errorDescription
      })
    }
  }

  const handleDialogToggle = (open: boolean) => {
    if (!open) {
      setConfirmDialog(prevState => ({ ...prevState, open }))
    }
  }

  return {
    confirmDialog,
    handleSelectTemplate,
    handleConfirmLoad,
    handleDialogToggle
  }
}

export function TemplateSelector() {
  const { templates, isLoading, clearAndLoadTemplate, mergeTemplate } = useSeedTemplates()
  const {
    confirmDialog,
    handleSelectTemplate,
    handleConfirmLoad,
    handleDialogToggle
  } = useConfirmDialog({ clearAndLoadTemplate, mergeTemplate })

  return (
    <>
      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">{ui.tabs.templates}</TabsTrigger>
          <TabsTrigger value="explorer">{ui.tabs.explorer}</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6 mt-6">
          <TemplateSelectorHeader title={ui.header.title} description={ui.header.description} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isLoading={isLoading}
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>

          <TemplateActionsAlert
            loadTitle={ui.alerts.loadTitle}
            loadDescription={ui.alerts.loadDescription}
            mergeTitle={ui.alerts.mergeTitle}
            mergeDescription={ui.alerts.mergeDescription}
          />
        </TabsContent>

        <TabsContent value="explorer" className="mt-6">
          <TemplateExplorer />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDialog.open}
        actionType={confirmDialog.actionType}
        template={confirmDialog.template}
        onCancel={() => handleDialogToggle(false)}
        onConfirm={handleConfirmLoad}
        onOpenChange={handleDialogToggle}
      />
    </>
  )
}
