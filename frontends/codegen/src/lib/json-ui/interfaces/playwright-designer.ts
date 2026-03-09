import { PlaywrightTest } from '@/types/project'

export interface PlaywrightDesignerProps {
  tests: PlaywrightTest[]
  onTestsChange: (tests: PlaywrightTest[]) => void
}
