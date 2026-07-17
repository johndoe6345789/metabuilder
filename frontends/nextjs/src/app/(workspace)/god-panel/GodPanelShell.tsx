'use client'

import { NerdModeIde } from '@/components/nerd-mode-ide'
import { GodPanelTopBar } from './GodPanelTopBar'
import { GodPanelTabNav } from './GodPanelTabNav'
import { GodPanelContextBar } from './GodPanelContextBar'
import { GodPanelWalkMe } from './GodPanelWalkMe'
import { GodPanelPanels } from './GodPanelPanels'
import { WALK_ME_STEPS } from './tabs/god-panel-config'
import { useGodPanelState } from './use-god-panel-state'
import s from './page.module.scss'

export function GodPanelShell() {
  const state = useGodPanelState()

  return (
    <div className={s.root}>
      <GodPanelTopBar
        guideOpen={state.guideOpen}
        nerdOpen={state.nerd.isOpen}
        onHome={() => {
          state.preview(1)
        }}
        onPreview={state.preview}
        onToggleGuide={() => {
          state.setGuideOpen(open => !open)
        }}
        onToggleNerd={state.nerd.toggle}
      />
      <GodPanelTabNav
        tabs={state.tabs}
        activeTab={state.activeTab}
        onSelectTab={state.setActiveTab}
      />
      <GodPanelContextBar
        tab={state.activeTabConfig}
        onShowGuide={() => {
          state.setGuideOpen(true)
        }}
      />
      <GodPanelWalkMe
        open={state.guideOpen && state.currentStep !== undefined}
        currentStep={state.guideStep}
        steps={WALK_ME_STEPS}
        tabs={state.tabs}
        onClose={() => {
          state.setGuideOpen(false)
        }}
        onBack={() => {
          const nextStep = Math.max(state.guideStep - 1, 0)
          state.moveGuide(nextStep)
        }}
        onNext={() => {
          const nextStep = Math.min(state.guideStep + 1, 8)
          state.moveGuide(nextStep)
        }}
        onSelectStep={index => {
          state.moveGuide(index)
        }}
      />
      <GodPanelPanels tabs={state.tabs} activeTab={state.activeTab} />
      {state.nerd.isOpen && <NerdModeIde onClose={state.nerd.close} />}
    </div>
  )
}
