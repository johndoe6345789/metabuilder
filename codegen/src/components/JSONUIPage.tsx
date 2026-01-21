import { useState, useEffect } from 'react'
import { JSONUIRenderer } from '@/lib/json-ui/renderer'
import { Action, UIComponent, Layout } from '@/lib/json-ui/schema'
import { toast } from 'sonner'

interface JSONUIPageProps {
  jsonConfig: any
}

export function JSONUIPage({ jsonConfig }: JSONUIPageProps) {
  const [dataMap, setDataMap] = useState<Record<string, any>>({})

  useEffect(() => {
    if (jsonConfig.dataSources) {
      const initialData: Record<string, any> = {}
      
      Object.entries(jsonConfig.dataSources).forEach(([key, source]: [string, any]) => {
        if (source.type === 'static') {
          initialData[key] = source.config
        }
      })
      
      setDataMap(initialData)
    }
  }, [jsonConfig])

  const updateDataField = (source: string, field: string, value: any) => {
    setDataMap((prev) => ({
      ...prev,
      [source]: {
        ...prev[source],
        [field]: value,
      },
    }))
  }

  const handleAction = (actions: Action[], event?: any) => {
    actions.forEach((action) => {
      const actionKey = action.type === 'custom' ? action.id : action.type
      console.log('Action triggered:', actionKey, action.params, event)

      switch (actionKey) {
        case 'refresh-data':
          toast.success('Data refreshed')
          break
        case 'create-project':
          toast.info('Create project clicked')
          break
        case 'deploy':
          toast.info('Deploy clicked')
          break
        case 'view-logs':
          toast.info('View logs clicked')
          break
        case 'settings':
          toast.info('Settings clicked')
          break
        case 'add-project':
          toast.info('Add project clicked')
          break
        case 'view-project':
          toast.info(`View project: ${action.params?.projectId}`)
          break
        case 'edit-project':
          toast.info(`Edit project: ${action.params?.projectId}`)
          break
        case 'delete-project':
          toast.error(`Delete project: ${action.params?.projectId}`)
          break
        case 'update-field':
          if (event?.target) {
            const { name, value } = event.target
            updateDataField('formData', name, value)
          }
          break
        case 'update-checkbox':
          if (action.params?.field) {
            updateDataField('formData', action.params.field, event)
          }
          break
        case 'update-date':
          if (action.params?.field) {
            updateDataField('formData', action.params.field, event)
          }
          break
        case 'update-files':
          if (action.params?.field) {
            updateDataField('formData', action.params.field, event)
          }
          break
        case 'submit-form':
          toast.success('Form submitted!')
          console.log('Form data:', dataMap.formData)
          break
        case 'cancel-form':
          toast.info('Form cancelled')
          break
        case 'toggle-dark-mode':
          updateDataField('settings', 'darkMode', event)
          toast.success(`Dark mode ${event ? 'enabled' : 'disabled'}`)
          break
        case 'toggle-auto-save':
          updateDataField('settings', 'autoSave', event)
          toast.success(`Auto-save ${event ? 'enabled' : 'disabled'}`)
          break
        case 'toggle-email-notifications':
          updateDataField('notifications', 'email', event)
          toast.success(`Email notifications ${event ? 'enabled' : 'disabled'}`)
          break
        case 'toggle-push-notifications':
          updateDataField('notifications', 'push', event)
          toast.success(`Push notifications ${event ? 'enabled' : 'disabled'}`)
          break
        case 'toggle-2fa':
          updateDataField('security', 'twoFactor', event)
          toast.success(`Two-factor auth ${event ? 'enabled' : 'disabled'}`)
          break
        case 'logout-all-sessions':
          toast.success('All other sessions logged out')
          break
        case 'save-settings':
          toast.success('Settings saved successfully')
          console.log('Settings:', dataMap)
          break
        case 'reset-settings':
          toast.info('Settings reset to defaults')
          break
        default:
          console.log('Unhandled action:', actionKey)
      }
    })
  }

  if (!jsonConfig.layout) {
    return <div className="p-6 text-muted-foreground">No layout defined</div>
  }

  const layoutComponent: UIComponent = {
    id: jsonConfig.layout.type || 'root-layout',
    type: 'div',
    className: jsonConfig.layout.className,
    style: {
      display: jsonConfig.layout.type === 'flex' ? 'flex' : 'block',
      flexDirection: jsonConfig.layout.direction === 'column' ? 'column' : 'row',
      gap: jsonConfig.layout.gap ? `${jsonConfig.layout.gap * 0.25}rem` : undefined,
      padding: jsonConfig.layout.padding ? `${jsonConfig.layout.padding * 0.25}rem` : undefined,
    },
    children: jsonConfig.layout.children || [],
  }

  return (
    <div className="h-full w-full overflow-auto">
      <JSONUIRenderer
        component={layoutComponent}
        dataMap={dataMap}
        onAction={handleAction}
      />
    </div>
  )
}
