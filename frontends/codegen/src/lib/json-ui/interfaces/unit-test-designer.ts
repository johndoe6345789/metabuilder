import { UnitTest } from '@/types/project'

export interface UnitTestDesignerProps {
  tests: UnitTest[]
  onTestsChange: (tests: UnitTest[]) => void
}
