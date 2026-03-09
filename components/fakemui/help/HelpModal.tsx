/**
 * HelpModal Component
 * Main in-app help and documentation modal
 */

import React from 'react';
import { useDocumentation } from '../../hooks/useDocumentation';
import { testId } from '../../utils/accessibility';
import DocNavigation from './DocNavigation';
import DocContentRenderer from './DocContentRenderer';

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
  } = useDocumentation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
  };

  const handleClearSearch = () => {
    clearSearchResults();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
        onClick={closeHelpModal}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        data-testid={testId.modal('help')}
        role="dialog"
        aria-labelledby="help-modal-title"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 id="help-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Help & Documentation
          </h2>
          <button
            onClick={closeHelpModal}
            aria-label="Close help modal"
            data-testid={testId.button('close-help')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'var(--color-text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Navigation */}
          <div
            role="navigation"
            aria-label="Documentation navigation"
            style={{
              width: '250px',
              borderRight: '1px solid var(--color-border)',
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            <DocNavigation onPageSelect={goToPage} currentPageId={currentPage?.id} />
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Search Bar */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search documentation"
                data-testid={testId.input('help-search')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-surface-hover)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {searchQuery && searchResults.length > 0 ? (
                <DocContentRenderer
                  pages={searchResults}
                  isSearchResults={true}
                  onPageSelect={goToPage}
                />
              ) : searchQuery && searchResults.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No results found for "{searchQuery}"</p>
              ) : currentPage ? (
                <DocContentRenderer pages={[currentPage]} onPageSelect={goToPage} />
              ) : (
                <p style={{ color: 'var(--color-text-secondary)' }}>Select a topic from the left to get started</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={goBackInHistory}
            disabled={!canGoBack}
            aria-label="Go back to previous page"
            data-testid={testId.button('help-back')}
            style={{
              padding: '8px 16px',
              backgroundColor: !canGoBack ? 'var(--color-surface-hover)' : 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              cursor: !canGoBack ? 'not-allowed' : 'pointer',
              opacity: !canGoBack ? 0.5 : 1,
            }}
          >
            ← Back
          </button>
          <button
            onClick={closeHelpModal}
            data-testid={testId.button('close-help-footer')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default HelpModal;
