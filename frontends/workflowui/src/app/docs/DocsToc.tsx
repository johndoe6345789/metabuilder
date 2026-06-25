/**
 * DocsToc - Table of contents panel for docs page
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import styles from '@scss/atoms/docs.module.scss';
import TABLE_OF_CONTENTS from './toc.json';

interface DocsTocProps {
  activeTocItem: string;
  setActiveTocItem: (id: string) => void;
}

export default function DocsToc({
  activeTocItem,
  setActiveTocItem,
}: DocsTocProps) {
  return (
    <Box
      component="aside"
      className={styles.toc}
      data-testid="docs-toc"
    >
      <Typography
        variant="caption"
        className={styles.tocTitle}
      >
        On This Page
      </Typography>
      {TABLE_OF_CONTENTS.map((item) => (
        <Box
          key={item.id}
          component="a"
          href={`#${item.id}`}
          className={`${styles.tocLink} ${
            activeTocItem === item.id ? styles.active : ''
          }`}
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
  );
}
