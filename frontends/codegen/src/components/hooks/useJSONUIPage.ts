/**
 * useJSONUIPage
 *
 * State and action handling for the JSONUIPage
 * component. Initialises static data sources,
 * provides field update helpers, and dispatches
 * all named UI actions.
 */

import {
  useState,
  useEffect,
  useCallback,
} from 'react'
import { Action } from '@/lib/json-ui/schema'
import { toast } from '@/components/ui/sonner'

export function useJSONUIPage(jsonConfig: any) {
  const [dataMap, setDataMap] = useState<
    Record<string, any>
  >({})

  useEffect(() => {
    if (!jsonConfig.dataSources) return
    const initialData: Record<string, any> = {}
    Object.entries(jsonConfig.dataSources).forEach(
      ([key, source]: [string, any]) => {
        if (source.type === 'static') {
          initialData[key] = source.config
        }
      }
    )
    setDataMap(initialData)
  }, [jsonConfig])

  const updateDataField = useCallback(
    (source: string, field: string, value: any) => {
      setDataMap((prev) => ({
        ...prev,
        [source]: { ...prev[source], [field]: value },
      }))
    },
    []
  )

  const handleAction = useCallback(
    (actions: Action[], event?: any) => {
      actions.forEach((action) => {
        const key =
          action.type === 'custom'
            ? action.id
            : action.type
        switch (key) {
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
            toast.info(
              `View project: ${action.params?.projectId}`
            )
            break
          case 'edit-project':
            toast.info(
              `Edit project: ${action.params?.projectId}`
            )
            break
          case 'delete-project':
            toast.error(
              `Delete project: ${action.params?.projectId}`
            )
            break
          case 'update-field':
            if (event?.target) {
              const { name, value } = event.target
              updateDataField('formData', name, value)
            }
            break
          case 'update-checkbox':
          case 'update-date':
          case 'update-files':
            if (action.params?.field) {
              updateDataField(
                'formData',
                action.params.field,
                event
              )
            }
            break
          case 'submit-form':
            toast.success('Form submitted!')
            break
          case 'cancel-form':
            toast.info('Form cancelled')
            break
          case 'toggle-dark-mode':
            updateDataField('settings', 'darkMode', event)
            toast.success(
              `Dark mode ${event ? 'enabled' : 'disabled'}`
            )
            break
          case 'toggle-auto-save':
            updateDataField('settings', 'autoSave', event)
            toast.success(
              `Auto-save ${event ? 'enabled' : 'disabled'}`
            )
            break
          case 'toggle-email-notifications':
            updateDataField('notifications', 'email', event)
            toast.success(
              `Email notifications ${event ? 'enabled' : 'disabled'}`
            )
            break
          case 'toggle-push-notifications':
            updateDataField('notifications', 'push', event)
            toast.success(
              `Push notifications ${event ? 'enabled' : 'disabled'}`
            )
            break
          case 'toggle-2fa':
            updateDataField(
              'security',
              'twoFactor',
              event
            )
            toast.success(
              `Two-factor auth ${event ? 'enabled' : 'disabled'}`
            )
            break
          case 'logout-all-sessions':
            toast.success('All other sessions logged out')
            break
          case 'save-settings':
            toast.success('Settings saved successfully')
            break
          case 'reset-settings':
            toast.info('Settings reset to defaults')
            break
          default:
            console.log('Unhandled action:', key)
        }
      })
    },
    [updateDataField]
  )

  return { dataMap, handleAction }
}
