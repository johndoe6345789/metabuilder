/**
 * HelpModal Component
 * Main in-app help and documentation modal
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useDocumentation } from '../../hooks/useDocumentation';
import { testId } from '../../utils/accessibility';
import DocNavigation from './DocNavigation';
import DocContentRenderer from './DocContentRenderer';
import styles from './Help.module.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export const HelpModal: React.FC = () => {
  const {
    isOpen,
    closeHelpModal,
    currentPage,
    searchQuery,
    searchResults,
    canGoBack,
    goBackInHistory,
    goToPage,
    search,
    clearSearchResults,
    navigationTree,
  } = useDocumentation();

  const [tabValue, setTabValue] = useState(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    search(value);
  };

  const handleClearSearch = () => {
    clearSearchResults();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeHelpModal}
      maxWidth="lg"
      fullWidth
      data-testid={testId.modal('help')}
      role="dialog"
      aria-labelledby="help-modal-title"
    >
      <DialogTitle
        id="help-modal-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Help & Documentation</Typography>
        <Button
          size="small"
          onClick={closeHelpModal}
          aria-label="Close help modal"
          data-testid={testId.button('close-help')}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '600px' }}>
          {/* Sidebar Navigation */}
          <Box
            sx={{
              width: '250px',
              borderRight: '1px solid #e0e0e0',
              overflowY: 'auto',
              p: 2,
            }}
            role="navigation"
            aria-label="Documentation navigation"
          >
            <DocNavigation
              onPageSelect={goToPage}
              currentPageId={currentPage?.id}
            />
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Search Bar */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                gap: 1,
              }}
            >
              <TextField
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
                aria-label="Search documentation"
                data-testid={testId.input('help-search')}
              />
              {searchQuery && (
                <Button
                  size="small"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {searchQuery && searchResults.length > 0 ? (
                <DocContentRenderer
                  pages={searchResults}
                  isSearchResults={true}
                  onPageSelect={goToPage}
                />
              ) : searchQuery && searchResults.length === 0 ? (
                <Typography color="textSecondary">
                  No results found for "{searchQuery}"
                </Typography>
              ) : currentPage ? (
                <DocContentRenderer
                  pages={[currentPage]}
                  onPageSelect={goToPage}
                />
              ) : (
                <Typography color="textSecondary">
                  Select a topic from the left to get started
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={goBackInHistory}
          disabled={!canGoBack}
          aria-label="Go back to previous page"
          data-testid={testId.button('help-back')}
        >
          ← Back
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={closeHelpModal}
          variant="contained"
          data-testid={testId.button('close-help-footer')}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal;
