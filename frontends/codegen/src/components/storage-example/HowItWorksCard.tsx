import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@metabuilder/fakemui/surfaces'
import copy from '@/data/storage-example.json'

export function HowItWorksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {copy.howItWorks.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {copy.howItWorks.steps.map((step) => (
            <div key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <div>
          <h4>
            {copy.howItWorks.codeExampleTitle}
          </h4>
          <pre>
            {copy.howItWorks.codeSample}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
