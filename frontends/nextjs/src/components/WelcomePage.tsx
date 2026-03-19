'use client'

import { Container, Typography, Button, Stack, Paper, Chip, Avatar } from '@/fakemui'

/**
 * WelcomePage - Level 1 Public Landing
 *
 * Mirrors old/src/components/Level1.tsx public landing page.
 * Shows the 5-level architecture overview and sign-in CTAs.
 */
export function WelcomePage() {
  return (
    <Container {...{ maxWidth: 'md', sx: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 } } as Record<string, unknown>}>
      <Paper elevation={0} sx={{ textAlign: 'center', p: 4, mb: 4, maxWidth: 600 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary, #6200ee), var(--accent, #03dac6))', margin: '0 auto 16px' }} />
        <Typography variant="h3" gutterBottom>
          Build Anything, Visually
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          A 5-level meta-architecture for creating entire applications through visual workflows,
          schema editors, and embedded scripting. No code required.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" href="/app">
            Get Started
          </Button>
          <Button variant="outlined" href="/app/ui/login">
            Sign In
          </Button>
          <Button variant="text" href="/dbal-daemon">
            DBAL Status
          </Button>
        </Stack>
      </Paper>

      {/* Five levels of power (from Level1.tsx) */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Five Levels of Power
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, width: '100%', maxWidth: 700 }}>
        {[
          { level: 1, name: 'Public Website', desc: 'Landing pages and public content', color: '#2196f3' },
          { level: 2, name: 'User Area', desc: 'Profiles, dashboards, comments', color: '#4caf50' },
          { level: 3, name: 'Admin Panel', desc: 'Data management and CRUD', color: '#ff9800' },
          { level: 4, name: 'God Builder', desc: 'Schemas, workflows, Lua', color: '#9c27b0' },
          { level: 5, name: 'Super God', desc: 'Multi-tenant control', color: '#ffc107' },
        ].map(item => (
          <Paper key={item.level} sx={{ p: 2, borderTop: `3px solid ${item.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: item.color, fontSize: '0.8rem' }}>
                {item.level}
              </Avatar>
              <Typography variant="subtitle2">{item.name}</Typography>
            </div>
            <Typography variant="caption" color="text.secondary">
              {item.desc}
            </Typography>
          </Paper>
        ))}
      </div>
    </Container>
  )
}
