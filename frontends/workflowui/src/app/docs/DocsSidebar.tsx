/**
 * DocsSidebar - Navigation sidebar for docs page
 */

'use client';

import React from 'react';
import { Box, Typography, Button } from '@metabuilder/m3';
import styles from '@scss/atoms/docs.module.scss';

interface Section {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
  sections: Section[];
}

interface DocsSidebarProps {
  categories: Category[];
  selectedCategory: string;
  selectedSection: string;
  navigate: (category: string, section: string) => void;
}

export default function DocsSidebar({
  categories,
  selectedCategory,
  selectedSection,
  navigate,
}: DocsSidebarProps) {
  return (
    <Box
      component="aside"
      className={styles.sidebar}
      data-testid="docs-sidebar"
    >
      {categories.map((category) => (
        <Box
          key={category.id}
          className={styles.sidebarSection}
        >
          <Typography
            variant="caption"
            className={styles.sectionTitle}
          >
            {category.title}
          </Typography>
          {category.sections.map((section) => (
            <Button
              key={section.id}
              variant={
                selectedCategory === category.id &&
                selectedSection === section.id
                  ? 'contained'
                  : 'text'
              }
              onClick={() =>
                navigate(category.id, section.id)
              }
              className={styles.navButton}
              data-testid={`doc-section-${section.id}`}
            >
              {section.title}
            </Button>
          ))}
        </Box>
      ))}
    </Box>
  );
}
