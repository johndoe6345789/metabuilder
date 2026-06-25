import {
  Card,
  Button,
  Divider,
  MaterialIcon,
} from '@metabuilder/components/m3'

const iconStyle = (extra?: object) => ({
  marginRight: '8px',
  ...extra,
})

export function SocialActionsSection() {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="social-actions-section"
      role="region"
      aria-label="Social action buttons"
    >
      <div>
        <h2
          style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Social Actions
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Grouped interactive buttons for social features
        </p>
      </div>

      <Card className="p-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost" size="sm">
              <MaterialIcon name="favorite" style={iconStyle()} />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <MaterialIcon name="chat_bubble" style={iconStyle()} />
              Comment
            </Button>
            <Button variant="ghost" size="sm">
              <MaterialIcon name="share" style={iconStyle()} />
              Share
            </Button>
          </div>

          <Divider />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <Button variant="outlined" size="sm">
                <MaterialIcon
                  name="favorite"
                  style={iconStyle({ color: 'var(--mat-sys-error)' })}
                />
                <span style={{ color: 'var(--mat-sys-on-background)' }}>
                  256
                </span>
              </Button>
              <Button variant="outlined" size="sm">
                <MaterialIcon name="chat_bubble" style={iconStyle()} />
                <span>42</span>
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button variant="ghost" size="sm">
                <MaterialIcon name="share" />
              </Button>
              <Button variant="ghost" size="sm">
                <MaterialIcon name="more_horiz" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
