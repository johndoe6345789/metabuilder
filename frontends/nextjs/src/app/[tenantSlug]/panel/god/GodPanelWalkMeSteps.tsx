'use client'

import type { GodPanelTab } from '@/lib/packages/navigation'
import type { WalkStep } from './tabs/walk-me-steps'
import s from './page.module.scss'

type Props = {
  steps: readonly WalkStep[]
  tabs: readonly GodPanelTab[]
  currentStep: number
  onSelectStep: (index: number) => void
}

export function GodPanelWalkMeSteps({
  steps,
  tabs,
  currentStep,
  onSelectStep,
}: Props) {
  return (
    <div className={s.walkSteps}>
      {steps.map((item, index) => {
        const tab = tabs.find(candidate => candidate.id === item.tabId)
        return (
          <button
            key={item.tabId}
            type="button"
            className={`${s.walkStep} ${
              index === currentStep ? s.walkStepActive : ''
            }`}
            onClick={() => {
              onSelectStep(index)
            }}
          >
            <span>{index + 1}</span>
            <strong>{tab?.label ?? item.title}</strong>
          </button>
        )
      })}
    </div>
  )
}
