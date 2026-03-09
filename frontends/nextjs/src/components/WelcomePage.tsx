'use client'

import { Container, Typography, Button, Stack, Paper } from '@/fakemui'

export function WelcomePage() {
  return (
    <Container {...{ maxWidth: 'sm', sx: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } } as Record<string, unknown>}>
      <Paper elevation={0} sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h3" gutterBottom>
          MetaBuilder
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Data-driven application platform. Configure routes via the admin panel or install a package with a default home page.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
          <Button variant="contained" color="primary" href="/app/ui/login">
            Sign In
          </Button>
          <Button variant="outlined" href="/app/dbal-daemon">
            DBAL Status
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
