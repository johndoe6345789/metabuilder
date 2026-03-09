/**
 * DocNavigation Component
 * Sidebar navigation for documentation categories and pages
 */

import React, { useState } from 'react';
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
    <nav
      role="region"
      aria-label="Documentation sections"
      data-testid={testId.helpNav('documentation')}
    >
      {navigationTree.map(({ section, pages }) => (
        <div key={section.id} style={{ marginBottom: '12px' }}>
          <button
            onClick={() => handleToggleSection(section.id)}
            aria-expanded={expandedSections.has(section.id)}
            aria-controls={`section-${section.id}`}
            data-testid={testId.button(`section-${section.id}`)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#1976d2',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 'inherit',
              textAlign: 'left',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </span>
            <span>{expandedSections.has(section.id) ? '▼' : '▶'}</span>
          </button>

          {expandedSections.has(section.id) && (
            <ul
              id={`section-${section.id}`}
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                paddingLeft: '16px',
              }}
            >
              {pages.map((page) => (
                <li key={page.id} style={{ marginBottom: '4px' }}>
                  <button
                    onClick={() => onPageSelect(page.id)}
                    data-testid={testId.navLink(page.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      background: 'none',
                      border: 'none',
                      borderLeft: currentPageId === page.id ? '3px solid #1976d2' : '3px solid transparent',
                      backgroundColor: currentPageId === page.id ? '#f5f5f5' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div style={{ fontWeight: currentPageId === page.id ? 500 : 400 }}>
                      {page.title}
                    </div>
                    {page.estimatedReadTime && (
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                        {page.estimatedReadTime} min
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
};

export default DocNavigation;
