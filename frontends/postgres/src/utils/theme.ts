'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d0bcff',
      contrastText: '#381e72',
    },
    secondary: {
      main: '#ccc2dc',
      contrastText: '#332d41',
    },
    background: {
      default: '#1c1b1f',
      paper: '#2b2930',
    },
    text: {
      primary: '#e6e1e5',
      secondary: '#cac4d0',
    },
    divider: 'rgba(202,196,208,0.12)',
    action: {
      selected: 'rgba(208,188,255,0.12)',
      hover: 'rgba(208,188,255,0.08)',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600, fontSize: '0.9375rem' },
    h6: { fontWeight: 600, fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1c1b1f',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(202,196,208,0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#211f26',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(202,196,208,0.08)',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#cac4d0',
          minWidth: 40,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#6750a4',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#7965af',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(202,196,208,0.38)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(208,188,255,0.6)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d0bcff',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '4px 8px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          margin: '1px 0',
          width: '100%',
          '&.Mui-selected': {
            backgroundColor: '#4a4458',
            color: '#eaddff',
            '& .MuiListItemIcon-root': {
              color: '#eaddff',
            },
            '&:hover': {
              backgroundColor: '#524f5e',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(208,188,255,0.08)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(202,196,208,0.08)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px !important',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#322f37',
            color: '#cac4d0',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(208,188,255,0.04)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(202,196,208,0.08)',
          fontSize: '0.8125rem',
        },
      },
    },
  },
});
