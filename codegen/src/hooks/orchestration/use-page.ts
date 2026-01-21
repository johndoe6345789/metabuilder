import { useState, useEffect, useMemo } from 'react'
import { PageSchema } from '@/types/page-schema'
import { useFiles } from '../data/use-files'
import { useModels } from '../data/use-models'
import { useComponents } from '../data/use-components'
import { useWorkflows } from '../data/use-workflows'
import { useLambdas } from '../data/use-lambdas'
import { useActions } from './use-actions'
import { evaluateBindingExpression } from '@/lib/json-ui/expression-helpers'
import { evaluateTemplate } from '@/lib/json-ui/expression-evaluator'

export function usePage(schema: PageSchema) {
  const files = useFiles()
  const models = useModels()
  const components = useComponents()
  const workflows = useWorkflows()
  const lambdas = useLambdas()
  
  const [computedData, setComputedData] = useState<Record<string, any>>({})
  
  const dataContext = useMemo(() => {
    const context: Record<string, any> = {
      files: files.files,
      models: models.models,
      components: components.components,
      workflows: workflows.workflows,
      lambdas: lambdas.lambdas,
      setFiles: files.addFile,
      setModels: models.addModel,
      setComponents: components.addComponent,
      setWorkflows: workflows.addWorkflow,
      setLambdas: lambdas.addLambda,
      ...computedData,
    }
    
    if (schema.seedData) {
      Object.assign(context, schema.seedData)
    }
    
    return context
  }, [files, models, components, workflows, lambdas, computedData, schema.seedData])
  
  const { execute, isExecuting, handlers } = useActions(schema.actions, dataContext)
  
  useEffect(() => {
    if (schema.data) {
      const computed: Record<string, any> = {}

      schema.data.forEach(source => {
        if (source.expression) {
          computed[source.id] = evaluateBindingExpression(source.expression, { ...dataContext, ...computed }, {
            fallback: undefined,
            label: `derived data (${source.id})`,
          })
          return
        }

        if (source.valueTemplate) {
          computed[source.id] = evaluateTemplate(source.valueTemplate, { data: { ...dataContext, ...computed } })
          return
        }

        if (source.type === 'static' && source.defaultValue !== undefined) {
          computed[source.id] = source.defaultValue
        }
      })

      setComputedData(computed)
    }
  }, [schema.data, dataContext])
  
  return {
    context: dataContext,
    execute,
    isExecuting,
    handlers,
    schema,
  }
}
