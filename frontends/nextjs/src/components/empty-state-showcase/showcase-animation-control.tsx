'use client'

/** The animations on/off switch. */

export function AnimationControl({
  animationsEnabled,
  setAnimationsEnabled,
}: {
  animationsEnabled: boolean
  setAnimationsEnabled: (on: boolean) => void
}) {
  return (
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: '#495057',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={e => {
                setAnimationsEnabled(e.target.checked)
              }}
              style={{
                marginRight: '8px',
                cursor: 'pointer',
              }}
            />
            Enable Animations
          </label>
          <p
            style={{
              fontSize: '12px',
              color: '#868e96',
              margin: '4px 0 0 0',
            }}
          >
            Fade-in animations on mount
          </p>
        </div>
  )
}
