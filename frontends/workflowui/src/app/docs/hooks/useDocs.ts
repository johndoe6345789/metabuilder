/**
 * useDocs - Docs page navigation state
 */

'use client';

import { useState } from 'react';
import DOC_CATEGORIES from '../doc-categories.json';

export function useDocs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('getting-started');
  const [selectedSection, setSelectedSection] = useState('intro');
  const [activeTocItem, setActiveTocItem] = useState('overview');

  const currentCategory = DOC_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );
  const currentSection = currentCategory?.sections.find(
    (sec) => sec.id === selectedSection
  );

  const navigate = (categoryId: string, sectionId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSection(sectionId);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedSection,
    activeTocItem,
    setActiveTocItem,
    currentCategory,
    currentSection,
    navigate,
    categories: DOC_CATEGORIES,
  };
}
