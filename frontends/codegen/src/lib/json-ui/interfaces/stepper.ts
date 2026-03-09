export interface StepperProps {
  steps: Array<{
    label: string
    description?: string
  }>
  currentStep: number
  className?: string
}
