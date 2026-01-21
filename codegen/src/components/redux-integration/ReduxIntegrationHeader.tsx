import reduxIntegrationCopy from '@/data/redux-integration-demo.json'

export function ReduxIntegrationHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{reduxIntegrationCopy.page.title}</h1>
      <p className="text-muted-foreground">{reduxIntegrationCopy.page.description}</p>
    </div>
  )
}
