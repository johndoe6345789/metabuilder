'use client'

import { Typography } from '@/m3'
import { godPanelConfig } from '@/lib/packages/navigation'
import type { QuickTool } from './use-overview-tools'
import s from '../OverviewTab.module.scss'

/** The tools row, one card per configured action. */
export function QuickTools({ onRun }: { onRun: (tool: QuickTool) => void }) {
  return (
    <>
      <Typography variant="subtitle2" gutterBottom className={s.sectionTitle}>
        Quick Actions
      </Typography>
      <div className={s.toolsGrid}>
        {godPanelConfig.tools.map(tool => (
          <button
            key={tool.id}
            type="button"
            className={s.toolCard}
            onClick={() => {
              onRun(tool)
            }}
          >
            <span className={`material-symbols-rounded ${s.toolIcon}`}>
              {tool.icon}
            </span>
            <Typography variant="body2">{tool.label}</Typography>
          </button>
        ))}
      </div>
    </>
  )
}
