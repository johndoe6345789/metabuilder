import {
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@metabuilder/components/fakemui'

interface Props {
  open: boolean
  message: string
  onClose: () => void
}

export function TurboErrorDialog({ open, message, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogHeader>
        <DialogTitle>Turbologin Failed</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p style={{ margin: '0 0 0.75rem' }}>{message}</p>
        <p style={{ margin: 0 }}>
          Copy a Turbologin from{' '}
          <a
            href="https://vault.wardcrew.com"
            target="_blank"
            rel="noreferrer"
          >
            vault.wardcrew.com
          </a>
          , then try again.
        </p>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.open('https://vault.wardcrew.com', '_blank')}
        >
          Open Vault
        </Button>
      </DialogActions>
    </Dialog>
  )
}
