/**
 * DocContentRenderer Component
 * Renders documentation pages and their content
 */

import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Paper,
  Link,
  Divider,
} from '@mui/material';
import { DocPage, DocContentBlock } from '../../types/documentation';
import { testId } from '../../utils/accessibility';
import styles from './Help.module.scss';

interface DocContentRendererProps {
  pages: (DocPage | undefined)[];
  isSearchResults?: boolean;
  onPageSelect?: (pageId: string) => void;
}

const ContentBlock: React.FC<{
  block: DocContentBlock;
  onPageSelect?: (pageId: string) => void;
}> = ({ block, onPageSelect }) => {
  const { type, content, title, level, language, variant, items, columns, rows, icon, subtext } =
    block;

  switch (type) {
    case 'heading':
      const HeadingTag = (`h${level}` as keyof JSX.IntrinsicElements) || 'h2';
      return (
        <Typography
          component={HeadingTag}
          variant={level === 1 ? 'h5' : level === 2 ? 'h6' : 'body1'}
          sx={{ mt: 2, mb: 1, fontWeight: 600 }}
        >
          {content}
        </Typography>
      );

    case 'text':
      return (
        <Typography paragraph sx={{ lineHeight: 1.6 }}>
          {content}
        </Typography>
      );

    case 'code':
      return (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#f5f5f5',
            overflowX: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}
        >
          <code>{content}</code>
        </Paper>
      );

    case 'list':
      return (
        <Box component="ul" sx={{ ml: 2, mb: 2 }}>
          {items?.map((item, idx) => (
            <Typography key={idx} component="li" sx={{ mb: 0.5 }}>
              {item}
            </Typography>
          ))}
        </Box>
      );

    case 'table':
      return (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {columns?.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 600 }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.map((row, idx) => (
                <TableRow key={idx}>
                  {row.map((cell, cellIdx) => (
                    <TableCell key={cellIdx}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );

    case 'callout':
      return (
        <Alert
          severity={variant || 'info'}
          sx={{ mb: 2 }}
          icon={icon}
          data-testid={testId.alert(`callout-${variant}`)}
        >
          <Typography variant="body2">{content}</Typography>
          {subtext && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {subtext}
            </Typography>
          )}
        </Alert>
      );

    case 'step':
      return (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            p: 1.5,
            backgroundColor: '#f9f9f9',
            borderLeft: '3px solid #2196f3',
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              minWidth: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
            }}
          >
            {icon}
          </Box>
          <Typography sx={{ lineHeight: 1.6 }}>{content}</Typography>
        </Box>
      );

    case 'image':
      return (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <img
            src={content}
            alt={title || 'Documentation image'}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
          />
          {title && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              {title}
            </Typography>
          )}
        </Box>
      );

    case 'video':
      return (
        <Box sx={{ mb: 2, position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={content}
            title={title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 4,
            }}
            allowFullScreen
          />
        </Box>
      );

    case 'example':
      return (
        <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#fafafa' }}>
          <CardContent>
            {title && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Example: {title}
              </Typography>
            )}
            <Typography variant="body2">{content}</Typography>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export const DocContentRenderer: React.FC<DocContentRendererProps> = ({
  pages,
  isSearchResults = false,
  onPageSelect,
}) => {
  const validPages = pages.filter((p): p is DocPage => !!p);

  if (!validPages.length) {
    return (
      <Typography color="textSecondary" data-testid={testId.text('no-content')}>
        No documentation available
      </Typography>
    );
  }

  return (
    <Box role="main" aria-label="Documentation content">
      {validPages.map((page, pageIdx) => (
        <Box
          key={page.id}
          data-testid={testId.section(`doc-page-${page.id}`)}
          sx={{ mb: pageIdx < validPages.length - 1 ? 4 : 0 }}
        >
          {/* Page Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {page.title}
            </Typography>
            {page.description && (
              <Typography color="textSecondary" sx={{ mb: 1 }}>
                {page.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {page.difficulty && (
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Difficulty: {page.difficulty}
                </Typography>
              )}
              {page.estimatedReadTime && (
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Read time: {page.estimatedReadTime} min
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Page Content */}
          <Box sx={{ my: 2 }}>
            {page.content.map((block, idx) => (
              <ContentBlock
                key={idx}
                block={block}
                onPageSelect={onPageSelect}
              />
            ))}
          </Box>

          {/* Related Pages */}
          {page.relatedPages && page.relatedPages.length > 0 && (
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Related Topics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {page.relatedPages.map((relatedId) => (
                  <Link
                    key={relatedId}
                    onClick={() => onPageSelect?.(relatedId)}
                    sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    component="button"
                    color="primary"
                    data-testid={testId.link(`related-${relatedId}`)}
                  >
                    View related topic →
                  </Link>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DocContentRenderer;
