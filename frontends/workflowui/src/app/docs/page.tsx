/**
 * Docs Page - Documentation and guides
 */

'use client';

import React, { useState } from 'react';
import { Breadcrumbs, Button, Box, Typography, TextField } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/docs.module.scss';

// Mock doc categories and sections
const DOC_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    sections: [
      { id: 'intro', title: 'Introduction' },
      { id: 'installation', title: 'Installation' },
      { id: 'quick-start', title: 'Quick Start' },
      { id: 'first-workflow', title: 'Your First Workflow' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    sections: [
      { id: 'rest-api', title: 'REST API' },
      { id: 'graphql', title: 'GraphQL' },
      { id: 'webhooks', title: 'Webhooks' },
      { id: 'authentication', title: 'Authentication' },
    ],
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    sections: [
      { id: 'email-automation', title: 'Email Automation' },
      { id: 'data-processing', title: 'Data Processing' },
      { id: 'api-integration', title: 'API Integration' },
      { id: 'custom-nodes', title: 'Custom Nodes' },
    ],
  },
  {
    id: 'guides',
    title: 'Guides',
    sections: [
      { id: 'best-practices', title: 'Best Practices' },
      { id: 'error-handling', title: 'Error Handling' },
      { id: 'performance', title: 'Performance' },
      { id: 'security', title: 'Security' },
    ],
  },
];

// Mock table of contents for current page
const TABLE_OF_CONTENTS = [
  { id: 'overview', title: 'Overview' },
  { id: 'prerequisites', title: 'Prerequisites' },
  { id: 'installation', title: 'Installation' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'next-steps', title: 'Next Steps' },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [selectedSection, setSelectedSection] = useState('intro');
  const [activeTocItem, setActiveTocItem] = useState('overview');

  const currentCategory = DOC_CATEGORIES.find((cat) => cat.id === selectedCategory);
  const currentSection = currentCategory?.sections.find((sec) => sec.id === selectedSection);

  return (
    <Box className={styles.docsPage} data-testid="docs-page">
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📚 Documentation', href: '/docs' },
        ]}
      />

      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h3" data-testid="docs-title">
          Documentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how to build powerful workflows with our comprehensive guides and tutorials
        </Typography>

        {/* Search Bar */}
        <Box className={styles.searchBar}>
          <TextField
            fullWidth
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="docs-search"
          />
        </Box>
      </Box>

      <Box className={styles.mainLayout}>
        {/* Sidebar Navigation */}
        <Box component="aside" className={styles.sidebar} data-testid="docs-sidebar">
          {DOC_CATEGORIES.map((category) => (
            <Box key={category.id} className={styles.sidebarSection}>
              <Typography variant="caption" className={styles.sectionTitle}>
                {category.title}
              </Typography>
              {category.sections.map((section) => (
                <Button
                  key={section.id}
                  variant={
                    selectedCategory === category.id && selectedSection === section.id
                      ? 'contained'
                      : 'text'
                  }
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedSection(section.id);
                  }}
                  className={styles.navButton}
                  data-testid={`doc-section-${section.id}`}
                >
                  {section.title}
                </Button>
              ))}
            </Box>
          ))}
        </Box>

        {/* Main Content */}
        <Box component="main" className={styles.mainContent} data-testid="docs-content">
          <Box className={styles.contentHeader}>
            <Box className={styles.breadcrumbs}>
              <Typography variant="caption">{currentCategory?.title}</Typography>
              <Typography variant="caption">/</Typography>
              <Typography variant="caption">{currentSection?.title}</Typography>
            </Box>
            <Typography variant="h4">{currentSection?.title}</Typography>
          </Box>

          <Box className={styles.contentBody}>
            {/* Placeholder content */}
            <Box className={styles.placeholder}>
              <Typography variant="h5" gutterBottom>
                📄 {currentSection?.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Documentation content for {currentSection?.title} will appear here.
                This includes detailed guides, code examples, API references, and best practices.
              </Typography>
            </Box>
          </Box>

          {/* Navigation Actions */}
          <Box className={styles.navActions}>
            <Button
              variant="outlined"
              disabled={selectedCategory === 'getting-started' && selectedSection === 'intro'}
              data-testid="docs-previous"
            >
              ← Previous
            </Button>
            <Button variant="contained" data-testid="docs-next">
              Next →
            </Button>
          </Box>
        </Box>

        {/* Table of Contents */}
        <Box component="aside" className={styles.toc} data-testid="docs-toc">
          <Typography variant="caption" className={styles.tocTitle}>
            On This Page
          </Typography>
          {TABLE_OF_CONTENTS.map((item) => (
            <Box
              key={item.id}
              component="a"
              href={`#${item.id}`}
              className={`${styles.tocLink} ${activeTocItem === item.id ? styles.active : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTocItem(item.id);
              }}
              data-testid={`toc-${item.id}`}
            >
              {item.title}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
