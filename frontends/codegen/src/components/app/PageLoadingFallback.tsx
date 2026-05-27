'use client'

export function PageLoadingFallback({
  message,
}: {
  message: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--mat-sys-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p
          style={{
            fontSize: '14px',
            color:
              'var(--mat-sys-on-surface-variant)',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  )
}
