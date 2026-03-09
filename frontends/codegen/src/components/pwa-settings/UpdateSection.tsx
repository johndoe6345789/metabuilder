import { Button } from '@metabuilder/fakemui/inputs'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { CloudArrowDown } from '@metabuilder/fakemui/icons'

interface UpdateSectionProps {
  isUpdateAvailable: boolean
  onUpdate: () => void
  copy: {
    title: string
    description: string
    label: string
    status: string
    action: string
  }
}

export function UpdateSection({ isUpdateAvailable, onUpdate, copy }: UpdateSectionProps) {
  if (!isUpdateAvailable) {
    return null
  }

  return (
    <Card>
      <div>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <div>
          <div>
            <CloudArrowDown size={20} />
            <div>
              <Label>{copy.label}</Label>
              <p>{copy.status}</p>
            </div>
          </div>
          <Button variant="filled" onClick={onUpdate}>{copy.action}</Button>
        </div>
      </div>
    </Card>
  )
}
