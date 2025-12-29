import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { componentCatalog } from '@/lib/components/component-catalog'
import { ComponentConfig, ComponentNode, Database } from '@/lib/database'

import { ComponentConfigActions } from './ComponentConfigDialog/Actions'
import { ComponentConfigFields } from './ComponentConfigDialog/Fields'

interface ComponentConfigDialogProps {
  node: ComponentNode
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  nerdMode?: boolean
}

export function ComponentConfigDialog({
  node,
  isOpen,
  onClose,
  onSave,
  nerdMode = false,
}: ComponentConfigDialogProps) {
  const [config, setConfig] = useState<ComponentConfig | null>(null)
  const [props, setProps] = useState<Record<string, unknown>>({})
  const [styles, setStyles] = useState<Record<string, unknown>>({})
  const [events, setEvents] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadConfig = async () => {
      const allConfigs = await Database.getComponentConfigs()
      const existingConfig = allConfigs[node.id]

      if (existingConfig) {
        setConfig(existingConfig)
        setProps(existingConfig.props || {})
        setStyles(existingConfig.styles || {})
        setEvents(existingConfig.events || {})
      } else {
        const componentDef = componentCatalog.find(c => c.type === node.type)
        setProps(componentDef?.defaultProps || {})
        setStyles({})
        setEvents({})
        setConfig(null)
      }
    }
    void loadConfig()
  }, [node.id, node.type])

  const handleSave = useCallback(async () => {
    const newConfig: ComponentConfig = {
      id: config?.id || `config_${Date.now()}`,
      componentId: node.id,
      props,
      styles,
      events,
    }

    const allConfigs = await Database.getComponentConfigs()
    allConfigs[node.id] = newConfig
    await Database.setComponentConfigs(allConfigs)

    toast.success('Configuration saved')
    onSave()
  }, [config, node.id, props, styles, events, onSave])

  const componentDef = componentCatalog.find(c => c.type === node.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configure {node.type}</DialogTitle>
          <DialogDescription>
            Set properties, styles, and event handlers for this component
          </DialogDescription>
        </DialogHeader>

        <ComponentConfigFields
          componentDef={componentDef}
          props={props}
          setProps={setProps}
          styles={styles}
          setStyles={setStyles}
          events={events}
          setEvents={setEvents}
          nerdMode={nerdMode}
        />

        <ComponentConfigActions onClose={onClose} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  )
}
