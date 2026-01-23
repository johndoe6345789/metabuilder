/**
 * DocNavigation Component
 * Sidebar navigation for documentation categories and pages
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { documentationService } from '../../services/documentationService';
import { testId } from '../../utils/accessibility';

interface DocNavigationProps {
  onPageSelect: (pageId: string) => void;
  currentPageId?: string | null;
}

export const DocNavigation: React.FC<DocNavigationProps> = ({
  onPageSelect,
  currentPageId,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const navigationTree = documentationService.getNavigationTree();

  const handleToggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <Box
      role="region"
      aria-label="Documentation sections"
      data-testid={testId.helpNav('documentation')}
    >
      {navigationTree.map(({ section, pages }) => (
        <Box key={section.id} sx={{ mb: 2 }}>
          {/* Section Header */}
          <Button
            fullWidth
            onClick={() => handleToggleSection(section.id)}
            sx={{
              justifyContent: 'space-between',
              textAlign: 'left',
              color: 'primary.main',
              fontWeight: 600,
              mb: 1,
            }}
            aria-expanded={expandedSections.has(section.id)}
            aria-controls={`section-${section.id}`}
            data-testid={testId.button(`section-${section.id}`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </Box>
            {expandedSections.has(section.id) ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </Button>

          {/* Pages List */}
          <Collapse
            in={expandedSections.has(section.id)}
            id={`section-${section.id}`}
          >
            <List sx={{ p: 0, ml: 1 }}>
              {pages.map((page) => (
                <ListItem
                  key={page.id}
                  disablePadding
                  data-testid={testId.listItem(`doc-page-${page.id}`)}
                >
                  <ListItemButton
                    selected={currentPageId === page.id}
                    onClick={() => onPageSelect(page.id)}
                    sx={{
                      py: 0.5,
                      px: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                      },
                    }}
                    data-testid={testId.navLink(page.id)}
                  >
                    <ListItemText
                      primary={page.title}
                      secondary={
                        page.estimatedReadTime ? `${page.estimatedReadTime} min` : undefined
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default DocNavigation;
