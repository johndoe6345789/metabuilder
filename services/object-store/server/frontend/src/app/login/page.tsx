'use client';

import {
  Box, Card, CardContent,
  Typography, Stack, Cloud,
} from '@shared/m3';
import { LoginForm } from '@/components/organisms';
import labels from '@/constants/ui-labels.json';

/** @brief S3 login page. */
export default function LoginPage() {
  return (
    <Box
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ width: 400, padding: 16 }}>
        <CardContent>
          <Stack
            alignItems="center"
            spacing={1}
            style={{ marginBottom: 24 }}
          >
            <Cloud />
            <Typography variant="h5">
              {labels.app.title}
            </Typography>
            <Typography style={{ opacity: 0.7 }}>
              {labels.login.title}
            </Typography>
          </Stack>
          <LoginForm />
        </CardContent>
      </Card>
    </Box>
  );
}
