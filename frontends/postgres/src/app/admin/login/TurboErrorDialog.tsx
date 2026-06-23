'use client';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function TurboErrorDialog({ open, message, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Turbologin Failed</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        <DialogContentText sx={{ mt: 1 }}>
          Copy a Turbologin from{' '}
          <a
            href="https://vault.wardcrew.com"
            target="_blank"
            rel="noreferrer"
          >
            vault.wardcrew.com
          </a>
          , then try again.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => window.open('https://vault.wardcrew.com', '_blank')}
        >
          Open Vault
        </Button>
      </DialogActions>
    </Dialog>
  );
}
