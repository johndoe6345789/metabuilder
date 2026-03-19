// fakemui/email/atoms/StarButton.tsx
import React, { forwardRef, useEffect, useState } from 'react'
import { MaterialIcon } from '../../../../icons/react/fakemui'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface StarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isStarred?: boolean
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const StarButton = forwardRef<
  HTMLButtonElement,
  StarButtonProps
>(({ isStarred = false, onToggleStar, testId, ...props }, ref) => {
  const [starred, setStarred] = useState(isStarred)

  useEffect(() => { setStarred(isStarred) }, [isStarred])

  const accessible = useAccessible({
    feature: 'email',
    component: 'star-button',
    identifier: testId || 'star'
  })

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const next = !starred
    setStarred(next)
    onToggleStar?.(next)
    props.onClick?.(e)
  }

  const label = starred ? 'Remove star' : 'Add star'
  const icon = starred ? 'star' : 'star_border'

  return (
    <button
      ref={ref}
      className={
        `star-button${starred ? ' star-button--active' : ''}`
      }
      aria-pressed={starred}
      aria-label={label}
      {...accessible}
      {...props}
      onClick={handleClick}
    >
      <MaterialIcon name={icon} fill={starred ? 1 : 0} />
    </button>
  )
})

StarButton.displayName = 'StarButton'
