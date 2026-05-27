/** Help Page - Help and support center */

'use client';

import React from 'react';
import { Box, Divider } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/help.module.scss';
import { useHelp } from './hooks/useHelp';
import HelpPageHeader from './HelpPageHeader';
import HelpFAQSection from './HelpFAQSection';
import HelpQuickLinks from './HelpQuickLinks';
import HelpGettingStarted from './HelpGettingStarted';
import HelpVideoTutorials from './HelpVideoTutorials';
import HelpContactSupport from './HelpContactSupport';

export default function HelpPage() {
  const {
    searchQuery,
    setSearchQuery,
    expandedAccordion,
    filteredFAQs,
    categories,
    handleAccordionChange,
  } = useHelp();

  return (
    <Box className={styles.helpPage} data-testid="help-page">
      <HelpPageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <HelpQuickLinks />
      <Divider sx={{ my: 4 }} />
      <HelpGettingStarted />
      <HelpVideoTutorials />
      <Divider sx={{ my: 4 }} />
      <HelpFAQSection
        filteredFAQs={filteredFAQs}
        categories={categories}
        expandedAccordion={expandedAccordion}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleAccordionChange={handleAccordionChange}
      />
      <HelpContactSupport />
    </Box>
  );
}
