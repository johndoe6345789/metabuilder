import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@metabuilder/m3/surfaces'
import { Button } from '@metabuilder/m3/inputs'
import { Badge } from '@metabuilder/m3/data-display'
import copy from '@/data/storage-example.json'

export function CounterCard({
  counter,
  onIncrement,
}: {
  counter: number
  onIncrement: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {copy.counter.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Badge variant="outline">
            {counter}
          </Badge>
        </div>
        <Button
          onClick={onIncrement}
          size="large"
        >
          {copy.counter.incrementButton}
        </Button>
        <p>{copy.counter.helper}</p>
      </CardContent>
    </Card>
  )
}
