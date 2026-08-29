'use client'

/** The explanatory footer. */

export function ShowcaseInfoBox() {
  return (
      <div
        style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '16px',
          padding: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1565c0',
            marginTop: 0,
            marginBottom: '8px',
          }}
        >
          💡 Implementation Tips
        </h3>
        <ul
          style={{
            fontSize: '13px',
            color: '#0d47a1',
            marginBottom: 0,
            paddingLeft: '20px',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>Compact size</strong> is best for modals and cards
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Normal size</strong> is the default for most pages
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Large size</strong> works well for full-page empty states
          </li>
          <li style={{ marginBottom: '6px' }}>
            All components support <strong>custom styling</strong> via className
            or style props
          </li>
          <li>
            Animations respect <strong>prefers-reduced-motion</strong> for
            accessibility
          </li>
        </ul>
      </div>
  )
}
