import { useMemo } from 'react'

interface DashboardTip {
  message: string
  show: boolean
}

interface UseDashboardTipsProps {
  totalFiles: number
  totalModels: number
  totalComponents: number
  totalThemeVariants: number
  totalTests: number
}

export function useDashboardTips({
  totalFiles,
  totalModels,
  totalComponents,
  totalThemeVariants,
  totalTests,
}: UseDashboardTipsProps): DashboardTip[] {
  return useMemo(() => {
    const tips: DashboardTip[] = [
      {
        message: 'Start by creating some code files in the Code Editor tab',
        show: totalFiles === 0,
      },
      {
        message: 'Define your data models in the Models tab to set up your database',
        show: totalModels === 0,
      },
      {
        message: 'Build your UI structure in the Components tab',
        show: totalComponents === 0,
      },
      {
        message: 'Create additional theme variants (dark mode) in the Styling tab',
        show: totalThemeVariants <= 1,
      },
      {
        message: 'Add tests for better code quality and reliability',
        show: totalTests === 0,
      },
    ]

    return tips.filter(tip => tip.show)
  }, [totalFiles, totalModels, totalComponents, totalThemeVariants, totalTests])
}
