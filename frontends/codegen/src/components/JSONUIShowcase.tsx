import { useJSONUIShowcase } from
  '@/components/json-ui-showcase/hooks/useJSONUIShowcase'
import { ShowcaseHeader } from
  '@/components/json-ui-showcase/ShowcaseHeader'
import { ShowcaseTabs } from
  '@/components/json-ui-showcase/ShowcaseTabs'
import { ShowcaseFooter } from
  '@/components/json-ui-showcase/ShowcaseFooter'

export function JSONUIShowcase() {
  const {
    selectedExample,
    setSelectedExample,
    showJSON,
    setShowJSON,
    examples,
    copy,
  } = useJSONUIShowcase()

  return (
    <div className="h-full flex flex-col bg-background">
      <ShowcaseHeader copy={copy.header} />

      <div className="flex-1 overflow-hidden">
        <ShowcaseTabs
          examples={examples}
          copy={copy.tabs}
          selectedExample={selectedExample}
          onSelectedExampleChange={setSelectedExample}
          showJSON={showJSON}
          onShowJSONChange={setShowJSON}
        />
      </div>

      <ShowcaseFooter items={copy.footer.items} />
    </div>
  )
}
