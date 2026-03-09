'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Logout, Refresh, Inventory2 } from '@mui/icons-material';
import { useAuth } from '@/lib/auth';
import { apiClient, Container as ContainerType } from '@/lib/api';
import ContainerCard from '@/components/ContainerCard';
import TerminalModal from '@/components/TerminalModal';

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<ContainerType | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchContainers = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const data = await apiClient.getContainers();
      setContainers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch containers');
      if (err instanceof Error && err.message === 'Session expired') {
        router.push('/');
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContainers();
      const interval = setInterval(fetchContainers, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleOpenShell = (container: ContainerType) => {
    setSelectedContainer(container);
    setIsTerminalOpen(true);
  };

  const handleCloseTerminal = () => {
    setIsTerminalOpen(false);
    setTimeout(() => setSelectedContainer(null), 300);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleRefresh = () => {
    fetchContainers();
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'rgba(45, 55, 72, 0.5)',
          backdropFilter: 'blur(8px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(56, 178, 172, 0.1)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2 sx={{ color: 'secondary.main' }} />
            </Box>
            <Box>
              <Typography
                variant="h1"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.5rem' }}
              >
                Container Shell
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {containers.length} active {containers.length === 1 ? 'container' : 'containers'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
              startIcon={isRefreshing ? <CircularProgress size={16} /> : <Refresh />}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.dark', borderRadius: 1 }}>
            <Typography color="error.contrastText">{error}</Typography>
          </Box>
        )}

        {containers.length === 0 && !isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Inventory2 sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h2" gutterBottom>
              No Active Containers
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 500 }}>
              There are currently no running containers to display. Start a container to see it
              appear here.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {containers.map((container) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={container.id}>
                <ContainerCard
                  container={container}
                  onOpenShell={() => handleOpenShell(container)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {selectedContainer && (
        <TerminalModal
          open={isTerminalOpen}
          onClose={handleCloseTerminal}
          containerName={selectedContainer.name}
          containerId={selectedContainer.id}
        />
      )}
    </Box>
  );
}
