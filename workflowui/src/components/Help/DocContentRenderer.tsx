/**
 * DocContentRenderer Component
 * Renders documentation pages and their content (minimal version without external UI library)
 */

import React from 'react';
import { DocPage, DocContentBlock } from '../../types/documentation';
import { testId } from '../../utils/accessibility';

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
      const HeadingTag = (`h${level}` as keyof React.JSX.IntrinsicElements) || 'h2';
      return React.createElement(
        HeadingTag,
        { style: { marginTop: '16px', marginBottom: '8px', fontWeight: 600 } },
        content
      );

    case 'text':
      return <p style={{ lineHeight: 1.6 }}>{content}</p>;

    case 'code':
      return (
        <pre style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#f5f5f5',
          overflowX: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}>
          <code>{content}</code>
        </pre>
      );

    case 'list':
      return (
        <ul style={{ marginLeft: '16px', marginBottom: '16px' }}>
          {items?.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <table style={{
          marginBottom: '16px',
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #e0e0e0'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {columns?.map((col) => (
                <th key={col} style={{ fontWeight: 600, padding: '8px', textAlign: 'left', border: '1px solid #e0e0e0' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} style={{ padding: '8px', border: '1px solid #e0e0e0' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'callout':
      const bgColor = variant === 'error' ? '#ffebee' : variant === 'warning' ? '#fff3e0' : '#e3f2fd';
      const borderColor = variant === 'error' ? '#f44336' : variant === 'warning' ? '#ff9800' : '#2196f3';
      return (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: bgColor,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: '4px'
        }} data-testid={testId.alert(`callout-${variant}`)}>
          <p style={{ margin: '0 0 8px 0' }}>{content}</p>
          {subtext && <p style={{ margin: '0', fontSize: '0.875rem' }}>{subtext}</p>}
        </div>
      );

    case 'step':
      return (
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f9f9f9',
          borderLeft: '3px solid #2196f3',
          borderRadius: '4px'
        }}>
          <div style={{
            minWidth: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            {icon}
          </div>
          <p style={{ lineHeight: 1.6, margin: 0 }}>{content}</p>
        </div>
      );

    case 'image':
      return (
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <img
            src={content}
            alt={title || 'Documentation image'}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
          />
          {title && (
            <p style={{ display: 'block', marginTop: '8px', fontSize: '0.875rem', color: '#666' }}>
              {title}
            </p>
          )}
        </div>
      );

    case 'video':
      return (
        <div style={{ marginBottom: '16px', position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden' }}>
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
              borderRadius: '4px',
            }}
            allowFullScreen
          />
        </div>
      );

    case 'example':
      return (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#fafafa',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}>
          {title && (
            <h3 style={{ fontWeight: 600, marginBottom: '8px', marginTop: 0 }}>Example: {title}</h3>
          )}
          <p style={{ margin: 0 }}>{content}</p>
        </div>
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
      <p style={{ color: '#666' }} data-testid={testId.text('no-content')}>
        No documentation available
      </p>
    );
  }

  return (
    <main role="main" aria-label="Documentation content">
      {validPages.map((page, pageIdx) => (
        <section
          key={page.id}
          data-testid={testId.section(`doc-page-${page.id}`)}
          style={{ marginBottom: pageIdx < validPages.length - 1 ? '32px' : 0 }}
        >
          {/* Page Header */}
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontWeight: 700, marginBottom: '4px', marginTop: 0 }}>{page.title}</h1>
            {page.description && (
              <p style={{ color: '#666', marginBottom: '8px', margin: 0 }}>{page.description}</p>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              {page.difficulty && (
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  Difficulty: {page.difficulty}
                </span>
              )}
              {page.estimatedReadTime && (
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  Read time: {page.estimatedReadTime} min
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '16px 0' }} />

          {/* Page Content */}
          <div style={{ margin: '16px 0' }}>
            {page.content.map((block, idx) => (
              <ContentBlock
                key={idx}
                block={block}
                onPageSelect={onPageSelect}
              />
            ))}
          </div>

          {/* Related Pages */}
          {page.relatedPages && page.relatedPages.length > 0 && (
            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
              <h2 style={{ marginBottom: '16px', fontWeight: 600 }}>Related Topics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {page.relatedPages.map((relatedId) => (
                  <button
                    key={relatedId}
                    onClick={() => onPageSelect?.(relatedId)}
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      color: '#2196f3',
                      textAlign: 'left',
                      padding: 0,
                      fontSize: 'inherit'
                    }}
                    data-testid={testId.link(`related-${relatedId}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    View related topic →
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </main>
  );
};

export default DocContentRenderer;
