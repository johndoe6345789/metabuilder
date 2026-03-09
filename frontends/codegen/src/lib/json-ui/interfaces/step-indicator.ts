export interface StepIndicatorProps {
  steps: Array<{
    id: string
    label: string
  }>
  currentStep: string
  completedSteps?: string[]
  onStepClick?: (stepId: string) => void
  className?: string
}
