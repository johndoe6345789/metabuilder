'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import { apiClient } from '@/lib/api';

interface TerminalModalProps {
  open: boolean;
  onClose: () => void;
  containerName: string;
  containerId: string;
}

export default function TerminalModal({
  open,
  onClose,
  containerName,
  containerId,
}: TerminalModalProps) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    setOutput((prev) => [...prev, `$ ${command}`]);

    try {
      const result = await apiClient.executeCommand(containerId, command);
      setOutput((prev) => [...prev, result.output || '(no output)']);
    } catch (error) {
      setOutput((prev) => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsExecuting(false);
      setCommand('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleClose = () => {
    setOutput([]);
    setCommand('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '500px',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h2" component="div">
          Terminal - {containerName}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.875rem',
            padding: 2,
            minHeight: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            mb: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#161b22',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#30363d',
              borderRadius: '4px',
            },
          }}
        >
          {output.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontFamily: 'inherit' }}>
              Connected to {containerName}. Enter a command to start...
            </Typography>
          ) : (
            <Box component="pre" sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {output.join('\n')}
            </Box>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command (e.g., ls, pwd, echo 'hello')"
            disabled={isExecuting}
            variant="outlined"
            size="small"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              '& input': {
                fontFamily: '"JetBrains Mono", monospace',
              },
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleExecute}
            disabled={isExecuting || !command.trim()}
            startIcon={<Send />}
          >
            Execute
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
