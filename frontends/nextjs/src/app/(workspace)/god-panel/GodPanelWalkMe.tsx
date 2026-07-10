'use client'

import { Button } from '@/m3'
import type { GodPanelTab } from '@/lib/packages/navigation'
import type { WalkStep } from './tabs/god-panel-config'
import s from './page.module.scss'

type Props = {
  open: boolean
  currentStep: number
  steps: readonly WalkStep[]
  tabs: readonly GodPanelTab[]
  onClose: () => void
  onBack: () => void
  onNext: () => void
  onSelectStep: (index: number) => void
}

export function GodPanelWalkMe({
  open,
  currentStep,
  steps,
  tabs,
  onClose,
  onBack,
  onNext,
  onSelectStep,
}: Props) {
  if (!open) return null
  const step = steps[currentStep]
  if (step === undefined) return null

  return (
    <aside className={s.walkMe} aria-label="Walk Me guided build path">
      <div className={s.walkHeader}>
        <div>
          <span className={s.walkEyebrow}>Walk Me</span>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
        </div>
        <button
          type="button"
          className={s.iconButton}
          aria-label="Close Walk Me"
          onClick={onClose}
        >
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>
      <div className={s.walkSteps}>
        {steps.map((item, index) => {
          const tab = tabs.find(candidate => candidate.id === item.tabId)
          return (
            <button
              key={item.tabId}
              type="button"
              className={`${s.walkStep} ${index === currentStep ? s.walkStepActive : ''}`}
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
      <div className={s.walkActions}>
        <Button variant="outlined" size="small" disabled={currentStep === 0} onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" size="small" onClick={onNext}>
          {currentStep === steps.length - 1 ? 'Stay here' : 'Next'}
        </Button>
      </div>
    </aside>
  )
}
