import { Button, IconButton, MaterialIcon, Divider } from '@metabuilder/components/fakemui'

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500,
  color: 'var(--mat-sys-on-surface-variant)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}
const wrapRow = { display: 'flex', flexWrap: 'wrap' as const, gap: '16px' }
const col = { display: 'flex', flexDirection: 'column' as const, gap: '12px' }

export function ButtonGroups() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={col}>
        <h3 style={labelStyle}>Variants</h3>
        <div style={wrapRow}>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Destructive</Button>
          <Button variant="outlined">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="text">Link</Button>
        </div>
      </div>

      <Divider />

      <div style={col}>
        <h3 style={labelStyle}>Sizes</h3>
        <div style={{ ...wrapRow, alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <IconButton aria-label="Heart">
            <MaterialIcon name="favorite" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <Divider />

      <div style={col}>
        <h3 style={labelStyle}>With Icons</h3>
        <div style={wrapRow}>
          <Button>
            <MaterialIcon name="star" aria-hidden="true" />
            Favorite
          </Button>
          <Button variant="outlined">
            <MaterialIcon name="add" aria-hidden="true" />
            Add Item
          </Button>
          <Button variant="secondary">
            <MaterialIcon name="bolt" aria-hidden="true" />
            Quick Action
          </Button>
        </div>
      </div>

      <Divider />

      <div style={col}>
        <h3 style={labelStyle}>States</h3>
        <div style={wrapRow}>
          <Button disabled>Disabled</Button>
          <Button variant="outlined" disabled>Disabled Outline</Button>
        </div>
      </div>
    </div>
  )
}
