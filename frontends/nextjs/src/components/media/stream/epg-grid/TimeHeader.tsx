'use client'

import s from '../EpgGrid.module.scss'

export interface TimeHeaderProps {
  slots: Date[]
}

export function TimeHeader({ slots }: TimeHeaderProps) {
  return (
    <div className={s.timeHeader}>
      <div className={s.channelColSpacer} />
      <div className={s.timeSlots}>
        {slots.map(slot => (
          <span key={slot.toISOString()} className={s.timeLabel}>
            {slot.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        ))}
      </div>
    </div>
  )
}
