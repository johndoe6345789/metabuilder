/**
 * useHelp - Help page search and accordion state
 */

'use client';

import { useState } from 'react';
import faqs from '../faqs.json';

export function useHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<
    string | false
  >(false);

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      faq.answer
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      faq.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category))
  );

  const handleAccordionChange =
    (panel: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  return {
    searchQuery,
    setSearchQuery,
    expandedAccordion,
    filteredFAQs,
    categories,
    handleAccordionChange,
  };
}
