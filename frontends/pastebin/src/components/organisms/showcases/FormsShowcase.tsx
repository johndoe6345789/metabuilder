import {
  Card, Button, Input, FormLabel, Divider, MaterialIcon,
} from '@metabuilder/components/fakemui'
import styles from './FormsShowcase.module.scss'

const colStyle = { display: 'flex', flexDirection: 'column' as const, gap: '8px' }
const sectionStyle = { display: 'flex', flexDirection: 'column' as const, gap: '24px' }
const rowStyle = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', gap: '16px',
}
const h2Style = {
  fontSize: '1.875rem', lineHeight: '2.25rem',
  fontWeight: 700, marginBottom: '8px',
}
const h3Style = {
  fontSize: '1.25rem', lineHeight: '1.75rem',
  fontWeight: 600, marginBottom: '16px',
}
const subtextStyle = {
  fontSize: '0.875rem', lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
}
const mutedStyle = { color: 'var(--mat-sys-on-surface-variant)' }

export function FormsShowcase() {
  return (
    <section
      style={{ ...sectionStyle }}
      data-testid="forms-showcase"
      role="region"
      aria-label="Forms showcase"
    >
      <div>
        <h2 style={h2Style}>Forms</h2>
        <p style={mutedStyle}>
          Complete form layouts with validation and actions
        </p>
      </div>

      <Card style={{ padding: '24px' }}>
        <form style={sectionStyle}>
          <div>
            <h3 style={h3Style}>Create Account</h3>
            <p style={subtextStyle}>
              Fill in your details to get started
            </p>
          </div>

          <Divider />

          <div className={styles.twoColGrid}>
            <div style={colStyle}>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <Input id="firstName" placeholder="John" />
            </div>
            <div style={colStyle}>
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>

          <div style={colStyle}>
            <FormLabel htmlFor="formEmail">Email</FormLabel>
            <div style={{ position: 'relative' }}>
              <MaterialIcon name="mail" className={styles.inputIcon} aria-hidden="true" />
              <Input id="formEmail" type="email" placeholder="john@example.com" className={styles.inputWithIcon} />
            </div>
          </div>

          <div style={colStyle}>
            <FormLabel htmlFor="formPassword">Password</FormLabel>
            <div style={{ position: 'relative' }}>
              <MaterialIcon name="lock" className={styles.inputIcon} aria-hidden="true" />
              <Input id="formPassword" type="password" placeholder="••••••••" className={styles.inputWithIcon} />
            </div>
            <p style={subtextStyle}>Must be at least 8 characters</p>
          </div>

          <Divider />

          <div style={rowStyle}>
            <Button variant="outlined" type="button">Cancel</Button>
            <Button type="submit">
              Create Account
              <MaterialIcon name="arrow_forward" style={{ marginLeft: '8px' }} aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
