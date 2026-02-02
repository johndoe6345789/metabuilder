import React, { forwardRef, useState } from 'react'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isStarred?: boolean
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const StarButton = forwardRef<HTMLButtonElement, StarButtonProps>(
  ({ isStarred = false, onToggleStar, testId: customTestId, ...props }, ref) => {
    const [starred, setStarred] = useState(isStarred)

    const accessible = useAccessible({
      feature: 'email',
      component: 'star-button',
      identifier: customTestId || 'star'
    })

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newState = !starred
      setStarred(newState)
      onToggleStar?.(newState)
      props.onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={`star-button ${starred ? 'star-button--active' : ''}`}
        aria-pressed={starred}
        title={starred ? 'Remove star' : 'Add star'}
        {...accessible}
        {...props}
        onClick={handleClick}
      >
        {starred ? '⭐' : '☆'}
      </button>
    )
  }
)

StarButton.displayName = 'StarButton'
